'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var passport = require('passport');

// Load passport
require('./auth');

var routes = require('./routes');
var api = require('./routes/api');

var app = express();
var db = mongoose.connection;

// Configs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', true);

// Set globals
app.locals.env = app.get('env');
app.locals.title = 'Todo App';
app.locals.description = 'The most awesome todo app in the world.';

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(sassMiddleware({
    src: path.join(__dirname, 'scss'),
    dest: path.join(__dirname, 'public_generated/css'),
    prefix: '/css',
    outputStyle: 'compressed'
}));
app.use(express.static(path.join(__dirname, 'public_generated')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET || 'aa2814b45d12c9bdd6f2feaf31b096d6',
    saveUninitialized: false,
    resave: true,
    proxy: true,
    secure: app.get('env') === 'production',
    cookie: {
        path: '/',
        httpOnly: false,
        maxAge: null,
    },
}));
// Add session values to locals for use in views.
app.use(function(req, res, next) {
    res.locals.session = req.session;
    return next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/api', api);


// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler.
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
    // Next is actually useless, but I'm just using it to shut up jshint.
    return next;
});

module.exports = exports = new Promise(function(resolve, reject) {
    // Connect to database
    mongoose.connect(process.env.MONGO_URL ||
        ('mongodb://' + (process.env.DB_PORT_27017_TCP_ADDR + ':' +
        process.env.DB_PORT_27017_TCP_PORT + '/todo_app')));
    db.on('open', function() {
        resolve(app);
    });
    db.on('error', reject);
});
