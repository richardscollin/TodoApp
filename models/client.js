'use strict';

var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,
    CastError = mongoose.Error.CastError;

/**
 * Database models for OAuth2.0 clients.
 * 
 * @typedef Client
 * @property {ObjectId} _id The client's id.
 * @property {string} name The client's name.
 * @property {string} redirect_uri The uri to redirect to after authorization.
 * @property {string} secret The client's secret used for authentification.
 */
var schema = new Schema({
    name: { type: String, required: true },
    redirect_uri: { type: String, required: true },
    secret: { type: String, required: true }
});

/**
 * Finds a client by its id.
 * Mongoose already has a findById function, but I am
 * implementing my own to catch the CastError.
 * 
 * @param {ObjectId} id The client id to search for.
 * @return {Promise<Client>} The client that matches the id.
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
