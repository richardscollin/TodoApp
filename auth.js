'use strict';

var passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    LocalStrategy = require('passport-local').Strategy,
    ClientPasswordStrategy =
            require('passport-oauth2-client-password').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy;

// Import database models.
var User = require('./models/user'),
    Client = require('./models/client'),
    AccessToken = require('./models/accesstoken');

/**
 * [De]Serialize user.
 */
passport.serializeUser(function(user, next) {
    return next(null, user._id);
});
passport.deserializeUser(function(id, next) {
    return User.findOneAsync({ _id: id })
        .then(function(user) { return next(null, user); })
        .catch(next);
});

/**
 * Passport.js local strategy.
 * Authenticates a username/password combination against the local database.
 */
passport.use(new LocalStrategy(function(username, password, next) {
    return User.checkUserPass(username, password, true).then(function(user) {
        return next(null, user);
    }).catch(next);
}));

/**
 * Passport.js basic strategy.
 * This is supposed to authenticate the client, but
 * I'm making all users clients for the password grant_type.
 */
passport.use(new BasicStrategy(function(username, password, next) {
    return User.checkUserPass(username, password, true).then(function(user) {
        return next(null, user);
    }).catch(next);
}));

/**
 * Passport.js client password strategy.
 */
passport.use(new ClientPasswordStrategy(function(clientId, clientSecret, next) {
    return Client.findOneAsync({ _id: clientId, secret: clientSecret })
        .then(function(client) {
            return next(null, client);
        }).catch(next);
}));

/**
 * Passport.js Bearer Strategy
 */
passport.use(new BearerStrategy(function(accessToken, next) {
    return AccessToken.findOneAsync({ _id: accessToken }).then(function(token) {
        if (!token) { return next(null, null); }
        return User.findOneAsync({ _id: token.user_id },
                { password: false, salt: false }).then(function(user) {
            return next(null, user);
        });
    }).catch(next);
}));
