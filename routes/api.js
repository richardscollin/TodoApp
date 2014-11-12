'use strict';

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

router.get('/', function(req, res) {
    res.send({
        data: "Hello world",
        status: "success"
    });
});

var ListItem = mongoose.model('listItem', mongoose.Schema({
    name: String,
    description: String
}));

router.get('/hello/:id', function(req, res) {
    var lastItem = new ListItem({ name: req.params['id'] });
    lastItem.save(function (err) {
        if (err) {
            res.send({
                message: err,
                status: "Error"
            });
        } else {
            res.send({
                data: "Hello world",
                status: "success"
            });
        }
    });
});

module.exports = router;
