'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.send({
        data: "Hello world",
        status: "success"
    });
});

module.exports = router;
