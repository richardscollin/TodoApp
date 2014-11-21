'use strict';

var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    flash = require('connect-flash'),
    oauth2 = require('../oauth');

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
router.get('/register', flash(), function(req, res) {
    res.render('register', {
        title: 'Create a new account',
        duplicateUser: req.flash('duplicateUser')[0],
        invalidUsername: req.flash('invalidUsername')[0],
        invalidPassword: req.flash('invalidPassword')[0],
        invalidPasswordConfirm: req.flash('invalidPasswordConfirm')[0]
    });
});

/**
 * Creates a new user and logs in.
 */
router.post('/register', flash(), function(req, res, next) {
    // Password does not match password confirmation.
    if (req.body.passwordConfirm !== req.body.password) {
        req.flash('invalidPasswordConfirm', true);
        return res.redirect('/register');
    }

    User.newUser(req.body.username, req.body.password).then(function(user) {
        // Login and redirect to post-registration page
        return req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/register');
        });
    }).catch(function(e) {
        req.flash('duplicateUser', e.duplicate);
        req.flash('invalidUsername', e.username);
        req.flash('invalidPassword', e.password);
        return res.redirect('/register');
    });
});

/**
 * Renders the sign in page.
 */
router.get('/signin', flash(), function(req, res) {
    res.render('signin', {
        title: 'Sign in',
        failed: req.flash('failed')[0],
        username: req.flash('username')[0]
    });
});

/**
 * Checks sign in credentials.
 */
router.post('/signin', flash(), function(req, res, next) {
    return passport.authenticate('local', function(err, user) {
        if (err) { return next(err); }
        if (!user) {
            req.flash('failed', true);
            req.flash('username', req.body.username);
            return res.redirect('/signin');
        }
        return req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect(req.session.returnTo || '/signin/authorize');
        });
    })(req, res, next);
});

/**
 * Gets user authorization for OAUTH2.0.
 */
router.get('/signin/authorize', oauth2.authorization);
router.use('/signin/authorize/decision', oauth2.decision);

/**
 * Signs user out.
 */
router.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = exports = router;
