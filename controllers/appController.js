var mongoose = require('mongoose');
var express = require('express');
var moment = require('moment');
var passport = require('passport');
var uuidGenerator = require('node-uuid');
var Match = mongoose.model('Match');
var User = mongoose.model('User');
var Geolocation = mongoose.model('Geolocation');
var Character = mongoose.model('Character');

/* Registration to join game. */
function signup(req, res) {
	User.register(new User({username:req.body.username}), 
      req.body.password, function(err, user){
	    if (err) {
	      res.render('signup',{message:'Invalid username or password.'});
	    } else {
	      passport.authenticate('local')(req, res, function() {
	        res.redirect(303, '/choose-warrior');
	      });
    	}
  	});
}

/* Create and set user's Character Schema */
function createCharacterSchema(req, res) {
	var warriorName, warriorVal, character, imgUrlStr;

	warriorVal = req.body.warriors;
	switch(warriorVal) {
		case 'warrior0': warriorName = 'Dagger Damsel';
						 break;
		case 'warrior1': warriorName = 'Golden Swordsman';
						 break;
		case 'warrior2': warriorName = 'Brutal Bonesman';
						 break;
		case 'warrior3': warriorName = 'The White Wizard';
						 break;
		case 'warrior4': warriorName = 'Hammer Dwarf';
						 break;
		case 'warrior5': warriorName = 'Merciless Troll';
						 break;
	}

	imgUrlStr = "/images/icons128/"+warriorVal+".png"; 

	var character = new Character({
		cname: warriorName,
		imgURL: imgUrlStr, 
		user: req.user._id 
	});

	character.save(function(err, savedCharacter, count) {
		if(err) { throw err; }
		req.user._warrior = character._id;
		req.user.save(function(err, savedUser, count) {
			res.redirect(303, '/geolocation');
		});	
	});
}

/* Create and set user's Location Schema */
function createLocationSchema(req, res) {
	var geolocation = new Geolocation({
		continent: req.body.continent,
		country: req.body.country,
		city: req.body.city,
		user: req.user._id 
	});

	geolocation.save(function(err, savedGeolocation, count) {
		if(err) { throw err; }
		req.user._geolocation = geolocation._id;
		req.user.save(function(err, savedUser, count) {
			res.redirect(303, '/play');
		});
	});
}

/* Display user's three latest matches. */
function displayMatches(req, res) {
	User.findOne({username:req.user.username})
		.populate('_warrior')
		.exec(function(err, user) { 
			var tMatches = user.matches.slice(-3);
			//Find user's three latest matches to display on Arena page.
			Match.find({ $or:[ {'roomId':tMatches[0]}, {'roomId':tMatches[1]}, {'roomId':tMatches[2]} ]},
				function(err, matches, count) {
					var bMatches = matches.slice(-3); //Make a copy so we can reverse.
					bMatches.reverse();
					res.render('play', { 'matches' : bMatches, 'warrior' : user._warrior});
			});
		});
}

function initializeMatch(req, res) {
	var days = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
	var playersArr = [req.user.username, req.body.opponent],
		uuid = uuidGenerator.v1(),
		now = moment().format('dddd, MMMM Do YYYY, h:mm:ss a') ;

	var match = new Match({
		roomId : uuid,
		host : req.user.username, 
		status : true,
		date : now,
		players : playersArr
	});
	match.save(); 

	User.findOne({ username : req.body.opponent}, function(err, user, count) {
		user.matches.push(match.roomId);
		user.save();
	});

	User.findOne({username: req.user.username}, function(err, user, count) {
		user.matches.push(match.roomId);
		user.save(function(saveErr, saveUser, saveCount) {
			res.redirect(303, '/game?id='+uuid);
		});
	})
}

/* Find the requested opponent's information, if he exists. */
function findUser(req, res) {
	User.findOne({username:req.params.user})
		.populate('_geolocation')
		.exec(function(err, user) { 
			if(user) {
				var data = {'username':user.username,
							'found':true, 
							'geolocation': {
								'continent':user._geolocation.continent,
								'country':user._geolocation.country,
								'city':user._geolocation.city
							}};
				res.json(data);
			} else { res.json({ 'found' : false }); }
		});
}

function createMatch(req, res) {
	Match.findOne({roomId:req.query.id}, function(err, match, count) {
		if(match) { 
			if(match.status === false) {
				res.redirect(303, '/play');
			} else {
				var opponent = match.players[1];
				if(req.user.username === opponent) {
					match.status = 'active';
					match.markModified('status');
				}
			}
			res.render('game', { 'room' : match.roomId, 'username' : req.user.username});
		}
	});
}

exports.signup = signup;
exports.addUserCharacter = createCharacterSchema;
exports.addUserLocation = createLocationSchema;
exports.displayMatches = displayMatches;
exports.initializeMatch = initializeMatch;
exports.findUser = findUser;
exports.createMatch = createMatch;
