var mongoose = require('mongoose'),
	User = require('../models/user.js');

var Geolocation = new mongoose.Schema({
	continent: {type: String, required: true},
	country: {type: String, required: true},
	city: {type: String, required: true},
	_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

mongoose.model('Geolocation', Geolocation);

module.exports = Geolocation;