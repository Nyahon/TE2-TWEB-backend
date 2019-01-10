// Imports
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const conf = require('./conf').default
// Get database models
const User = require('./models/user')
const Movie = require('./models/movie')
const Watchlist = require('./models/watchlist')

// Useful variables
const app = express()

const corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
	next()
})

app.use(cors(corsOptions))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const mongoOpt = {
	useNewUrlParser: true,
	reconnectTries: conf.db.reconnectTries,
	reconnectInterval: conf.db.reconnectInterval
}

const mongoUrl = process.env.NODE_ENV === 'production' ? encodeURI(process.env.MONGODB_ENDPOINT_URL) : conf.db.url

// MangoDB connection with retry
const connectWithRetry = () => {
	mongoose.connect(mongoUrl, mongoOpt)
		.then(
			() => {
				console.log('Connected to MongoDB') // eslint-disable-line no-console
			},
			(err) => {
				console.error('Failed to connect to MongoDB', err) // eslint-disable-line no-console
				setTimeout(connectWithRetry, 5000)
			}
		)
}

app.set('secret', conf.secret)


// Connect to MongoDB
connectWithRetry()

/*************TE2 MAMENE ************************/

/********************************************
 * Unprotected routes
 *******************************************/

/*lol, ça marche */
app.post('/movies', (req, res, next) => {

	Movie.find({ title: req.body.title })
		.then(result => {
			if (result.length === 0) {
				const error = new Error('There is no such movie here. Did you mean "H2G2 The Hitchhiker\'s Guide to the Galaxy" ?')
				error.status = 404
				next(error)
			} else {
				res.send(result)
			}
		})
})

/* j'espère que c'est ça que tu me demandais, et étrangement j'espère aussi que c'est pas _juste_ ça. 
	Le développeur de Schrodinger, à la fois gavé et emerveillé. */

/*Ps: têtre j'ai le temps et la motivation de paginer, m'en voulez pas si je m'en vais.
	https://www.youtube.com/watch?v=6RAJdafk1Y8 */

app.get('/movies', (req, res, next) => {
	Movie.find()
		.then(result => res.send(result))
})



/**
* Sign a user up biaaaaaaaaaaaaaaaaaaaaaaaaaaaatch.
*/
app.post('/auth/register', (req, res, next) => {
	User.find({ email: req.body.email })
		.then(result => {
			if (result.length === 0) {
				User.create({
					name: req.body.name,
					email: req.body.email,
					password: req.body.password
				})
					.then((user) => {
						res.sendStatus(201)
						//res.send(user)
					})
			} else {
				const error = new Error('User already exists, unlike your brain')
				error.status = 400
				next(error)
			}
		})
})

/**
* Sign a user in
*/
app.post('/auth/login', (req, res, next) => {
	const email = req.body.email
	const password = req.body.password
	User.findOne({ email })
		.then((user) => {
			
			if (user === null){
				const error = new Error('Do not know that name, ma biche')
				error.status = 404
				next(error)		
			}

			else if( password === user.password ) {
				const payload = { email }
				const token = jwt.sign(payload, app.get('secret'), {
					expiresIn: 60 * 60 * 24 // expires in 24 hours
				})
				// return the information including token as JSON
				res.json({
					success: true,
					token,
					user: {
						id: user._id,
						name: user.name,
						email: user.email
					}
				})
			} else {
				const error = new Error('UNAUTHORIZED, ma biche')
				error.status = 401
				next(error)			
			}
		})
		.catch(next)
})

app.get('/users', (req, res, next) => {
	User.find()
		.then(result => res.send(result))
})



/**
 * Asks for a json web token for all subsequent routes
 * PROTECTION FOR THE WEAK
 * APPRECIATION FOR THE STRONG
 * JUSTICE FOR ALL
 */
app.use((req, res, next) => {
	const token = req.body.token || req.query.token || req.headers['x-access-token']

	if (token) {
		jwt.verify(token, app.get('secret'), (err, decoded) => {
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' })
			}
			req.decoded = decoded
			next()
			return null
		})
	} else {
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		})
	}
	return null
})

/********************************************
 * Protected prouts.
 *******************************************/
/*lol, ça marche presque */
app.post('/watchlists', (req, res, next) => {
	Watchlist.find({ id_user: req.body.id_user })
		.then(result => {

			if (result.length === 0) {
				const error = new Error('This user as no watchlist here, try another castle')
				error.status = 404
				next(error)
			} else {
				let wl = ""
				 const {user, list} = result
				 list.forEach(movie => {
					 Movie.find({title : movie})
					 .then(result => {
						 if(result.length !== 0){
							 //DIRTY COMME UN POMME D'API PERIME
							wl.concat(result);
						 }
					 })
				 });
				res.send(wl)
			}
		})
})
/*lol, ça marche */
app.post('/watchlist/', (req, res, next) => {

	Watchlist.find({ id_user: req.body.id_user })
		.then(result => {
	
			
			res.send(result)
			
		})
})

// Forward 404 to error handler
app.use((req, res, next) => {
	const error = new Error('Not found')
	error.status = 404
	next(error)
})

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
	console.error(err) // eslint-disable-line no-console
	res.status(err.status || 500)
	res.send(err.message)
})

// Server
const server = app.listen(process.env.PORT, () => {
	const host = server.address().address
	const port = server.address().port
	console.log('Node server listening at http://%s:%s', host, port) // eslint-disable-line no-console
})