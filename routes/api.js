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
 * Checks if the user from the token matches the one from the request.
 */
function checkUser(req, res, next) {
    if (req.params.username.toLowerCase() !== req.user.username) {
        return res.status(401).send('Unauthorized');
    }
    return next();
}

/**
 * Create a new user.
 */
router.post('/users/new', function(req, res, next) {
    User.newUser(req.body.username, req.body.password).then(function(user) {
        return res.status(201).json({
            status: 'success',
            data: { username: user.username }
        });
    }).catch(next);
});

/**
 * Gets a user's info.
 */
router.get('/users/:username', hasToken, checkUser, function(req, res) {
    return res.json({
        status: 'success',
        data: req.user
    });
});

/**
 * Retrieves an OAUTH2 token.
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
