var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    passport = require('passport'),
    controller = require('../controllers/appController.js');

/* Middleware to check if user is logged in */
function loggedIn(req, res, next) {
	if(req.user) {
		next();
	} else {
		res.render(303, '/login');
	}
}

/* HOMEPAGE */
router.get('/', function(req, res) {
	res.render('index', { user: req.user});
});

/* LOGIN PAGE */
router.get('/login', function(req, res) {
	res.render('login'); 
});

router.post('/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if(user) {
			req.logIn(user, function(err) {
				res.redirect(303, '/play');
			});
		} else {
			res.render('login', { message : 'Invalid username or password.' });
		}
	})(req, res, next);
});

/* LOGOUT */
router.get('/logout', function(req, res) {
	req.logout();
	res.redirect(303, '/');
});

/* SIGN UP PAGE */
router.get('/signup', function(req, res) {
	res.render('signup'); 
});

router.post('/signup', function(req, res) {
  controller.signup(req, res);  
});

/* CHOOSE WARRIOR PAGE */
router.get('/choose-warrior', loggedIn, function(req, res) {
	res.render('choose');
});

router.post('/choose-warrior', loggedIn, function(req, res) {
	controller.addUserCharacter(req, res);
});

/* LOCATION PAGE */
router.get('/geolocation', loggedIn, function(req, res) {
	res.render('geolocation');
});

router.post('/geolocation', loggedIn, function(req, res) {
	controller.addUserLocation(req, res);
});

/* ABOUT PAGE */
router.get('/about', function(req, res) {
	res.render('about');
});

/* PLAY PAGE */
router.get('/play', loggedIn, function(req, res, next) {
	controller.displayMatches(req, res);
});

router.post('/play', loggedIn, function(req, res) {
	controller.initializeMatch(req, res);
});

/* FIND USER */
router.get('/api/users/:user', loggedIn, function(req, res) {
	controller.findUser(req, res);
});

/* GAME PAGE */
router.get('/game', loggedIn, function(req, res) { 
	controller.createMatch(req, res);
});

module.exports = router;