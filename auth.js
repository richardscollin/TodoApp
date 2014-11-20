'use strict';

var passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    LocalStrategy = require('passport-local').Strategy,
    ClientPasswordStrategy =
            require('passport-oauth2-client-password').Strategy;

var User = require('./models/user'),
    Client = require('./models/client');

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
 * Passport.js local strategy.
 * Passes a user to the serialize function.
 */
passport.use(new LocalStrategy(function(username, password, next) {
    User.checkUserPass(username, password, true).then(function(user) {
        return next(null, user);
    }).catch(next);
}));

/**
 * Passport.js basic strategy.
 * Basically the same as the local strategy.
 */
passport.use(new BasicStrategy(function(username, password, next) {
    User.checkUserPass(username, password, true).then(function(user) {
        return next(null, user);
    }).catch(next);
}));

/**
 * Passport.js client password strategy.
 */
passport.use(new ClientPasswordStrategy(function(clientId, clientSecret, next) {
    Client.findOne({ _id: clientId, secret: clientSecret })
        .then(function(client) {
            return next(null, client);
        }).catch(next);
}));
