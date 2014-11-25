'use strict';

var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,
    crypto = Promise.promisifyAll(require('crypto')),
    ValidationError = mongoose.Error.ValidationError;

// Hashing settings.
var KEY_LEN = 256,
    ITERATIONS = 25000;

/**
 * The User database model.
 *
 * @typedef User
 * @property {ObjectId} _id The user's id.
 * @property {string} username The user's username normalized to lowercase.
 * @property {string} username_original_case The user's original username.
 * @property {string} password The PBKDF2 hashed password in base64.
 * @property {string} salt The salt used to hash the password.
 */
var schema = new Schema({
    username: {
        type: String,
        index: { unique: true },
        lowercase: true,
        trim: true,
        required: true
    },
    username_original_case: String,
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
 * Validator that checks for duplicate username.
 */
schema.path('username').validate(function(value, next) {
    return this.model('user').countAsync({ username: value })
        .then(function(count) {
            return next(count === 0);
        });
}, 'Username already exists');

/**
 * Validator for the password field.
 */
schema.path('password').validate(function(value) {
    if (!value) { return false; }
    return /^.{6,128}$/.test(value);
}, 'Invalid password');

/**
 * Presave function that hashes password in PBKDF2.
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
 * Creates a new user.
 *
 * @param {string} username The username of the new user.
 * @param {string} password The password of the new user.
 * @return {Promise<User>} The newly created user.
 */
schema.statics.newUser = function(username, password) {
    return new this({
        username: username,
        password: password,
        username_original_case: username
    }).saveAsync().then(function(user) {
        return user[0];
    }).catch(ValidationError, function(e) {
        if (e.errors.username && e.errors.username.message ===
                'Username already exists') {
            var duplicateUser = new Error('Username already exists');
            duplicateUser.status = 409;
            duplicateUser.duplicate = true;
            throw duplicateUser;
        }
        var invalidFields = new Error('Invalid fields');
        invalidFields.status = 400;
        invalidFields.username = !!e.errors.username;
        invalidFields.password = !!e.errors.password;
        throw invalidFields;
    });
};

/**
 * Checks if a username/password combination is valid.
 *
 * @param {string} username The username.
 * @param {password} password The password.
 * @param {boolean} returnUser=false Whether or not to return the user if valid.
 * @return {Promise} A boolean or a User depending on parameters.
 */
schema.statics.checkUserPass = function(username, password, returnUser) {
    return this.findOneAsync({ username: username.toLowerCase() })
        .then(function(user) {
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

// Enable virtuals on toObject calls.
schema.set('toObject', { virtuals: true });

module.exports = exports = mongoose.model('user', schema);
