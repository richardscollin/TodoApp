'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    ValidationError = mongoose.Error.ValidationError;

// Import models.
var User = require('../models/user.js');

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
            return res.status(409).json({
                status: 'error',
                message: 'Username already exists'
            });
        }
        console.log(e);
        return res.status(400).json({
            status: 'error',
            message: 'Invalid fields',
            fields: {
                username: !!e.errors.username,
                password: !!e.errors.password
            }
        });
    }).catch(next);
});

//Error handler for REST api.
router.use(function(err, req, res, next) {
    console.log('fooafasdfsa');
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
