var mongoose = require('mongoose'),
	passportLocalMongoose = require('passport-local-mongoose'),
	Match = require('../models/match.js'), 
	Character = require('../models/character.js'),
	Geolocation = require('../models/geolocation.js');

var User = new mongoose.Schema({
	matches : [String],
	_warrior : {type: mongoose.Schema.Types.ObjectId, ref: 'Character'},
	_geolocation : {type: mongoose.Schema.Types.ObjectId, ref: 'Geolocation'}
	/* passport-local-mongoose adds username, hash, & salt fields
	 * to the schema 
	*/
});

User.plugin(passportLocalMongoose);

mongoose.model('User', User);

module.exports = User;

