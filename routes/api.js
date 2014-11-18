'use strict';

var express = require('express');
var router = express.Router();

// Import models
var TodoItem = require('../models/todoitem');

router.get('/hello/:id', function(req, res) {
    var item = new TodoItem({ name: req.params.id });
    item.save(function(err) {
        if (err) {
            return res.send({
                message: err,
                status: "error"
            });
        }
        return res.send({
            data: "",
            status: "success"
        });
    });
});

module.exports = exports = router;
