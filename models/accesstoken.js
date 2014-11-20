'use strict';

var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

/**
 * Model to store access tokens for oauth2.
 */
var schema = new Schema({
    _id: { type: String, required: true, index: { unique: true } },
    user_id: { type: ObjectId, required: true },
    client_id: { type: ObjectId, required: true }
});

module.exports = exports = mongoose.model('accessToken', schema);
