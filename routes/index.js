'use strict';

var express = require('express'),
    router = express.Router();

router.get('/', function(req, res) {
    res.render('home');
});

router.get('/register', function(req, res) {
    res.render('register', { title: 'Create a new account' });
});

router.get('/signout', function(req, res) {
    req.session.destroy();
    return res.redirect('/');
});

module.exports = exports = router;
