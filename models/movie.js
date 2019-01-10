var mongoose = require('mongoose');


//Alors là j'ai pris un des morceaux dans movie.json, 
//et puis j'ai remplacé les valeurs numériques par 'Number'
//et les string par 'String'. Merci, merci. 

var movieSchema = new mongoose.Schema({
     vote_count  : Number,
      video  : Boolean,
      vote_average  : Number,
      title  :   String  ,
      popularity  : Number,
      poster_path  :   String  ,
      original_language  :   String  ,
      original_title  :   String  ,
      backdrop_path  :  String  ,
      adult  : Boolean,
      overview  :  String,
      release_date  :   { type: Date, default: Date.now }  ,
      tmdb_id  : Number,
      genres  : 
        [{
            type: String
        }]
    
  
});

module.exports = mongoose.model('Movie', movieSchema);