'use strict';

var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,
    crypto = Promise.promisifyAll(require('crypto'));

// Hashing settings
var KEY_LEN = 256,
    ITERATIONS = 25000;

var schema = new Schema({
    username: {
        type: String,
        index: { unique: true },
        lowercase: true,
        trim: true,
        required: true
    },
    password: { type: String, required: true },
    salt: String
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
        user.salt = buffer.toString('base64');
        return crypto.pbkdf2Async(user.password,
                user.salt, ITERATIONS, KEY_LEN);
    }).then(function(derivedKey) {
        user.password = derivedKey.toString('base64');
        return next();
    });
});

/**
 * Check if a username/password combination is valid.
 * @param {string} username The username.
 * @param {password} password The password.
 * @param {boolean} returnUser Whether or not to return the user if valid.
 * @return A Promise with boolean on whether user/pass is valid.
 */
schema.statics.checkUserPass = function(username, password, returnUser) {
    return this.findOneAsync({ username: username }).then(function(user) {
        if (!user) { return false; }
        return crypto.pbkdf2Async(password, user.salt, ITERATIONS, KEY_LEN)
            .then(function(derivedKey) {
                if (derivedKey.toString('base64') === user.password) {
                    return returnUser ? user : true;
                }
                return false;
            });
    });
};

/**
 * Virtual to extract timestamp from BSON ObjectID.
 */
schema.virtual('timestamp').get(function() {
    return this._id.getTimestamp();
});


schema.set('toObject', { virtuals: true });

module.exports = exports = mongoose.model('user', schema);
