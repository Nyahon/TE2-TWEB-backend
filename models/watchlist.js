var mongoose = require('mongoose');


//Alors là j'ai copié-collé movie.js, et maintenant je change les valeurs
// pour faire DE LA MAGIE POUR LES DEBILES WOUHOUU. 
// pardon, j'suis fatigué (mais pas d'être un enculé héééééééééééééé #burn).

var watchlistSchema = new mongoose.Schema({
     id_user : String, 
     list_movies: [{ type: String}]
});

module.exports = mongoose.model('watchlists', watchlistSchema);
