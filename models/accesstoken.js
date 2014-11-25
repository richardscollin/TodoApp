'use strict';

var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

/**
 * The AccessToken database model.
 *
 * @typedef AccessToken
 * @property {string} _id The access token's id.
 * @property {ObjectId} user_id The id of the user that owns the token.
 * @property {ObjectId} client_id The id of the client that is allowed access.
 */
var schema = new Schema({
    _id: { type: String, required: true, index: { unique: true } },
    user_id: { type: ObjectId, required: true },
    client_id: { type: ObjectId, required: true }
});

module.exports = exports = mongoose.model('accessToken', schema);
