var mongoose = require('mongoose'),
	User = require('../models/user.js');

var Match = new mongoose.Schema({
	roomId : String,
	host : String,
	status : {type: Boolean, default : true}, 
	date : String, 
	players : [User],
	winner : {type: String, default: 'TBD'}
});

mongoose.model('Match', Match);

module.exports = Match;

