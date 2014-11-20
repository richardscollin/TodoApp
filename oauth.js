'use strict';

var Promise = require('bluebird'),
    oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    crypto = Promise.promisifyAll(require('crypto'));

/**
 * Database models.
 */
var Client = require('./models/client'),
    AccessToken = require('./models/accesstoken');

var server = oauth2orize.createServer();

/**
 * (De)Serialize the client.
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
 * Password grant type.
 * Exchange username/password for access tokens.
 */
server.exchange(oauth2orize.exchange.password(function(client, username,
        password, scope, next) {
    crypto.randomBytesAsync(256).then(function(buffer) {
        var token = buffer.toString('base64');
        new AccessToken({
            _id: token,
            user_id: client._id,
            client_id: client._id
        }).saveAsync().then(function(localToken) {
            return next(null, localToken[0]._id);
        });
    }).catch(next);
}));

/**
 * The token endpoint middleware.
 */
module.exports = exports = {
    token: [
        passport.authenticate(['basic', 'oauth2-client-password'],
                { session: false }),
        server.token(),
        server.errorHandler()
    ]
};
