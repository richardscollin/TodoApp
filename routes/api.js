'use strict';

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var ListItem = mongoose.model('listItem', mongoose.Schema({
    name: String,
    description: String
}));

router.get('/', function(req, res) {
    res.send({
        data: "Hello world",
        status: "success"
    });
});


router.get('/hello/:id', function(req, res) {
    var listItem = new ListItem({ name: req.params.id });
    listItem.save(function(err) {
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
