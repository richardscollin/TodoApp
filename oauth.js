'use strict';

var Promise = require('bluebird'),
    oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    crypto = Promise.promisifyAll(require('crypto'));

/**
 * Database models.
 */
var Client = require('./models/client'),
    User = require('./models/user'),
    AccessToken = require('./models/accesstoken');

var server = oauth2orize.createServer();

/**
 * [De]Serialize the client.
 */
server.serializeClient(function(client, next) {
    return next(null, client._id);
});
server.deserializeClient(function(id, next) {
    Client.findOneAsync({ _id: id }).then(function(client) {
        return next(null, client);
    }).catch(next);
});

/**
 * Function to generate a token.
 *
 * Saves the token to the database before returning it.
 * @param {Client} client The oauth2 client.
 * @param {User} user The oauth2 user.
 * @param {number} size=256 The size of the token.
 * @return {AccessToken Promise} a base64 representation of the token.
 */
function generateToken(client, user, size) {
    return crypto.randomBytesAsync(size || 256).then(function(buffer) {
        var token = buffer.toString('base64');
        return new AccessToken({
            _id: token,
            user_id: user._id,
            client_id: client._id
        }).saveAsync().then(function(localToken) {
            // Mongoose save returns an array of the saved object.
            return localToken[0];
        });
    });
}

/**
 * Password grant type.
 *
 * Exchange username/password for access tokens.
 * Using User as client instead of Client. All users can
 * be client for themself or other users.
 */
server.exchange(oauth2orize.exchange.password(function(client, username,
        password, scope, next) {
    // Return new token if username is same as client.
    // Don't need to check for password since that was already done
    // in the basic auth.
    if (client.username === username) {
        return generateToken(client, client).then(function(token) {
            return next(null, token._id);
        }).catch(next);
    }

    // If the client is trying to get a token for another user, then
    // check the username and password.
    return User.checkUserPass(username, password, true).then(function(user) {
        if (!user) { return next(null, false); }
        return generateToken(client, user).then(function(token) {
            return next(null, token._id);
        });
    }).catch(next);
}));

/**
 * Implicit grant type.
 *
 * Grant implicit authorization. Mainly used for web/mobile apps.
 */
server.grant(oauth2orize.grant.token(function(client, user, ares, next) {
    return generateToken(client, user).then(function(token) {
        return next(null, token._id);
    }).catch(next);
}));

module.exports = exports = {
    /**
    * The token endpoint middleware.
    */
    token: [
        passport.authenticate(['basic', 'oauth2-client-password'],
                { session: false }),
        server.token(),
        server.errorHandler()
    ],

    /**
     * The authorization endpoint.
     */
    authorization: server.authorization(function(clientID, redirectURI, next) {
    })
};
