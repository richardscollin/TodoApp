'use strict';

var express = require('express'),
    router = express.Router(),
    oauth2 = require('../oauth'),
    passport = require('passport');


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
 * Create a new user.
 */
router.post('/users/new', function(req, res, next) {
    User.newUser(req.body.username, req.body.password).then(function(user) {
        return res.json({
            status: 'success',
            data: { username: user.username }
        });
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
