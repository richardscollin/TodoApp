'use strict';

var express = require('express');
var router = express.Router();

// Import models
var TodoItem = require('../models/todoitem');

router.get('/test/:id', function(req, res) {
    var item = new TodoItem({ name: req.params.id });
    item.saveAsync().then(function() {
        res.json({ status: 'success' });
    }).catch(function(err) {
        res.json(500, {
            status: 'error',
            message: err.message
        });
    });
});

module.exports = exports = router;
