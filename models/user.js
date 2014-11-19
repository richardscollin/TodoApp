'use strict';

var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,
    crypto = Promise.promisifyAll(require('crypto'));

// Hashing settings
var KEY_LEN = 256,
    ITERATIONS = 100000;

var schema = new Schema({
    username: {
        type: String,
        index: { unique: true },
        lowercase: true,
        trim: true,
        required: true
    },
    password: { type: Buffer, required: true },
    salt: Buffer
});

/**
 * Validator for username.
 */
schema.path('username').validate(function(value) {
    if (!value) { return false; }
    return /^[\w\d\_\.\-]{3,18}$/.test(value);
}, 'Invalid username');

/**
 * Check for duplicate usernames.
 */
schema.path('username').validate(function(value, next) {
    return this.model('user').countAsync({ username: value })
        .then(function(count) {
            return next(count === 0);
        });
}, 'Username already exists');

/**
 * Validate password.
 */
schema.path('password').validate(function(value) {
    if (!value) { return false; }
    return /^.{6,128}$/.test(value);
}, 'Invalid password');

/**
 * Hash password with PBKDF2 on save.
 */
schema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) { return next(); }

    return crypto.randomBytesAsync(KEY_LEN).then(function(buffer) {
        user.salt = buffer;
        return crypto.pbkdf2Async(user.password,
                user.salt, ITERATIONS, KEY_LEN);
    }).then(function(derivedKey) {
        user.password = derivedKey;
        return next();
    });
});

schema.virtual('timestamp').get(function() {
    return this._id.getTimestamp();
});

schema.set('toObject', { virtuals: true });

module.exports = exports = mongoose.model('user', schema);
