'use strict';

var mongoose = require('mongoose');

module.exports = exports = mongoose.model('listItem', mongoose.Schema({
    name: String,
    description: String
}));
