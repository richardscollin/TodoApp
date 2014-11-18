'use strict';

var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var schema = new Schema({
    list_id: { type: ObjectId, index: true },
    user_id: { type: ObjectId, index: true },
    name: String,
    description: String
});

schema.virtual('timestamp').get(function() {
    return this._id.getTimestamp();
});

schema.set('toObject', { virtuals: true });

module.exports = exports = mongoose.model('todoItem', schema);
