const conf = {
	db: {
		port: "27017",
		host: process.env.NODE_ENV === "production" ? process.env.MONGODB_ENDPOINT_URL : "mongodb",
		name: "te2tweb",
		usr: "dev",
		pwd: "dev",
		reconnectTries: 10,
		reconnectInterval: 500
	},
	secret: "undyingandeverlastingfurnaces"
}

conf.db.url = `mongodb://${conf.db.usr}:${conf.db.pwd}@${conf.db.host}:${conf.db.port}/${conf.db.name}`

exports.default = conf
