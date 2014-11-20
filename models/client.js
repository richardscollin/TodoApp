'use strict';

var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema;

/**
 * Model to store clients for oauth2 in the database.
 */
var schema = new Schema({
    name: { type: String, required: true },
    redirectURI: { type: String, required: true },
    secret: { type: String, required: true }
});

module.exports = exports = mongoose.model('client', schema);
