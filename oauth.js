'use strict';

var Promise = require('bluebird'),
    oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    login = require('connect-ensure-login'),
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
    return Client.findById(id).then(function(client) {
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
 * Grants implicit authorization. Mainly used for web/mobile apps.
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
     *
     * Shows a screen letting user allow or deny access from a client.
     */
    authorization: [
        login.ensureLoggedIn('/signin'),

        // Set default client_id, response_type, and redirect_uri to
        // that of this web app if it does not exist.
        function(req, res, next) {
            // Not sure why response_type is in body and the other are in query.
            req.body.response_type = req.body.response_type || 'token';
            req.query.client_id = req.query.client_id ||
                    req.app.get('clientId');
            req.query.redirect_uri = req.query.redirect_uri || '/';
            return next();
        },

        // Validates the client.
        server.authorization(function(clientId, redirectUri, next) {
            return Client.findById(clientId).then(function(client) {
                if (!client) { return next(null); }
                return next(null, client, new RegExp(client.redirect_uri)
                        .test(redirectUri) ? redirectUri : null);
            }).catch(next);
        }),

        function(req, res, next) {
            // If the client is not our client, ask for user authorization.
            if (!req.oauth2.client._id.equals(req.app.get('clientId'))) {
                return res.render('dialog', {
                    client: req.oauth2.client,
                    transactionId: req.oauth2.transactionID
                });
            }
            // The client is our client, so we are authorizing it
            // for the user by forwarding it to the server.decision()
            // middleware.
            req.body.transaction_id = req.oauth2.transactionID;
            return next();
        },
        server.decision()
    ],

    /**
     * The user decision endpoint.
     *
     * Allows a user to allow or deny access requested from the client.
     */
    decision: [
        login.ensureLoggedIn('/signin'),
        server.decision()
    ]
};
