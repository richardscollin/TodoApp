'use strict';

var express = require('express'),
    router = express.Router(),
    oauth2 = require('../oauth'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    ValidationError = mongoose.Error.ValidationError;


/**
 * Database models.
 */
var User = require('../models/user.js');

/**
 * Middleware for token authenticated requests.
 */
var hasToken = passport.authenticate('bearer', { session: false });

/**
 * Test token auth.
 */
router.get('/test', hasToken, function(req, res) {
    res.send(req.user);
});

/**
 * Creates a new user.
 * @param username The username to create.
 * @param password The password to create.
 * @param signin=false Whether or not to sign in after authentification.
 */
router.post('/users/new', function(req, res, next) {
    if (req.session.loggedIn) {
        var err = new Error('Already logged in');
        err.status = 403;
        return next(err);
    }
    var user = new User({
        username: req.body.username,
        password: req.body.password
    });

    return user.saveAsync().then(function(user) {
        if (req.body.signin) {
            req.session.username = user[0].username;
            req.session.loggedIn = true;
        }
        return res.json({
            status: 'success',
            data: {
                username: user[0].username
            }
        });
    }).catch(ValidationError, function(e) {
        if (e.errors.username && e.errors.username.message ===
                'Username already exists') {
            var err = new Error('Username already exists');
            err.status = 409;
            return next(err);
        }
        var invalid = new Error('Invalid fields');
        invalid.status = 400;
        return next(invalid);
    }).catch(next);
});

/**
 * Gets a user's info.
 */
router.get('/users/:username', function(req, res, next) {
    return User.findOneAsync({
        username: req.params.username
    }, { username: true }).then(function(user) {
        if (!user) {
            var err = new Error('User does not exist');
            err.status = 404;
            return next(err);
        }
        return res.json({ status: 'success', data: user });
    }).catch(console.log);
});

/**
 * Retrieve an OAUTH2 token.
 */
router.post('/oauth/token', oauth2.token);

/**
 * RESTful api error handler.
 */
router.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err.message
    });
    // Not actually calling next, just using it to get
    // Jshint to shut up about unused variables.
    return next;
});

module.exports = exports = router;
