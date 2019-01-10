const mongoose = require('mongoose')

const Schema = mongoose.Schema

//Attention, c'est subtile. 
//(Ta gueule Yohann, t'es chiant à faire le cynique alors que c'est juste parce que t'es une feignasse)
//J'te permets pas, partie-de-moi-qui-dit-la-vérité-et-qui-se-la-pète-tout-le-temps
//(Tu sais que j'ai raison. Je suis toi, après toi. tout. )
//Ou alors c'est moi qui suis toi ? Qui suis-je ? 
//(Je sais pas, mais la bonne nouvelle c'est qu'on a le modèle pour se sauver. 
const user = new Schema({
  name: String,
  email: String,
  password: String
})

module.exports = mongoose.model('users', user)
