'use strict';

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var User = require('./models/user');

/**
 * (De)Serialize user.
 */
passport.serializeUser(function(user, next) {
    return next(null, user._id);
});
passport.deserializeUser(function(id, next) {
    return User.findOneAsync({ _id: id }, { _id: true })
        .then(function(user) { return next(null, user); })
        .catch(next);
});

/**
 * Passport.js localstrategy.
 * Passes a user to the serialize function.
 */
passport.use(new LocalStrategy(function(username, password, next) {
    User.checkUserPass(username, password, true).then(function(user) {
        return next(null, user);
    }).catch(next);
}));

