'use strict';

var express = require('express'),
    router = express.Router(),
    passport = require('passport');

/**
 * Database models.
 */
var User = require('../models/user');

/**
 * Renders the home page.
 */
router.get('/', function(req, res) {
    res.render('home');
});

/**
 * Renders the registration page.
 */
router.get('/register', function(req, res) {
    res.render('register', { title: 'Create a new account' });
});

/**
 * Creates a new user and logs in.
 */
router.post('/register', function(req, res, next) {
    // Show welcome screen if logged in.
    if (req.user) {
        return res.render('register');
    }

    // Password does not match password confirmation.
    if (req.body.passwordConfirm !== req.body.password) {
        return res.render('register', {
            invalidPasswordConfirm: true,
        });
    }
    User.newUser(req.body.username, req.body.password).then(function(user) {
        // Login and redirect to post-registration page
        return req.logIn(user, function(err) {
            if (err) { return next(err); }
            res.redirect('/register');
        });
    }).catch(function(e) {
        return res.render('register', {
            duplicateUser: e.duplicate,
            invalidUsername: e.username,
            invalidPassword: e.password
        });
    });
});

/**
 * Renders the sign in page.
 */
router.get('/signin', function(req, res) {
    res.render('signin', { title: 'Sign in' });
});

/**
 * Checks sign in credentials.
 */
router.post('/signin', function(req, res, next) {
    return passport.authenticate('local', function(err, user) {
        if (err) { return next(err); }
        if (!user) {
            return res.render('signin', {
                username: req.body.username,
                failed: true
            });
        }
        return req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/');
        });
    })(req, res, next);
});

/**
 * Signs user out.
 */
router.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = exports = router;
