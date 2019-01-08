// Imports
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")

const conf = require("./conf").default
// Get database models
const User = require("./models/user")

// Useful variables
const app = express()

const corsOptions = {
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const mongoOpt = {
	useNewUrlParser: true,
	reconnectTries: conf.db.reconnectTries,
	reconnectInterval: conf.db.reconnectInterval
}

const mongoUrl = conf.db.url

// MangoDB connection with retry
const connectWithRetry = () => {
	mongoose.connect(mongoUrl, mongoOpt)
		.then(
			() => {
				console.log("Connected to MongoDB") // eslint-disable-line no-console
			},
			(err) => {
				console.error("Failed to connect to MongoDB", err) // eslint-disable-line no-console
				setTimeout(connectWithRetry, 5000)
			}
		)
}

app.set("secret", conf.secret)

// Connect to MongoDB
connectWithRetry()

/********************************************
 * Unprotected routes
 *******************************************/

/**
* Sign a user up
*/
app.post("/signup", (req, res, next) => {
	User.find({ email: req.body.email })
		.then(result => {
			if (result.length === 0) {
				User.create({
					name: req.body.name,
					email: req.body.email,
					password: req.body.password
				})
					.then((user) => {
						res.send(user)
					})
			} else {
				const error = new Error("Email already exists")
				error.status = 400
				next(error)
			}
		})
})

/**
* Sign a user in
*/
app.post("/signin", (req, res, next) => {
	const email = req.body.email
	const password = req.body.password
	User.findOne({ email })
		.then((user) => {
			if (password === user.password) {
				const payload = { email }
				const token = jwt.sign(payload, app.get("secret"), {
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
				throw new Error("Wrong password")
			}
		})
		.catch(next)
})

/**
 * Asks for a json web token for all subsequent routes
 */
app.use((req, res, next) => {
	const token = req.body.token || req.query.token || req.headers["x-access-token"]

	if (token) {
		jwt.verify(token, app.get("secret"), (err, decoded) => {
			if (err) {
				return res.json({ success: false, message: "Failed to authenticate token." })
			}
			req.decoded = decoded
			next()
			return null
		})
	} else {
		return res.status(403).send({
			success: false,
			message: "No token provided."
		})
	}
	return null
})

/********************************************
 * Protected routes
 *******************************************/


// Forward 404 to error handler
app.use((req, res, next) => {
	const error = new Error("Not found")
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
const server = app.listen(8081, () => {
	const host = server.address().address
	const port = server.address().port
	console.log("Node server listening at http://%s:%s", host, port) // eslint-disable-line no-console
})