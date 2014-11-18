'use strict';

var express = require('express'),
    router = express.Router();

router.get('/', function(req, res) {
    res.render('home');
});

router.get('/register', function(req, res) {
    res.render('register');
});

// Handle registration requests
router.post('/register', function(req, res) {
    res.send(req.body);
});

module.exports = exports = router;
