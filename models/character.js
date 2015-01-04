var mongoose = require('mongoose');

var Character = new mongoose.Schema({
	cname: {type: String, required: true},
	imgURL: {type: String, required: true}, 
	user: {type: mongoose.Schema.Types.ObjectId, ref:'User'}
});

mongoose.model('Character', Character);

module.exports = Character;