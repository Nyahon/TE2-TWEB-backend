conn = new Mongo()
db = conn.getDB(dbName)
db.auth(user, password)
db.createCollection('users')

user1 = ObjectId()
user2 = ObjectId()
user3 = ObjectId()

db.users.insertMany(
    [
        {
            _id: user1,
            name:'Alain Leroy',
            email:'alain@cool.com',
            password:'12345'
        },
        {
            _id: user2,
            name:'Bernard Darube',
            email:'bernard@cool.com',
            password:'12345'
        },
        {
            _id: user3,
            name:'Lucas Scofield',
            email:'lucas@cool.com',
            password:'12345'
        }
    ]
)

