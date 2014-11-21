'use strict';

var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,
    CastError = mongoose.Error.CastError;

/**
 * Model to store clients for oauth2 in the database.
 */
var schema = new Schema({
    name: { type: String, required: true },
    redirect_uri: { type: String, required: true },
    secret: { type: String, required: true }
});

/**
 * Finds a client by its id.
 *
 * Mongoose already has a findById function, but I am
 * implementing my own to catch the CastError.
 */
schema.statics.findById = function(id) {
    return this.findOneAsync({ _id: id }).then(function(client) {
        return client;
    }).catch(CastError, function() {
        // Catch type errors for when the ObjectID is invalid.
        return null;
    });
};

module.exports = exports = mongoose.model('client', schema);
