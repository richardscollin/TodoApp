'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var passport = require('passport');

// Load Passport.js settings.
require('./auth');

// Import router middleware.
var routes = require('./routes');
var api = require('./routes/api');

var app = express();
var db = mongoose.connection;

// Set express configs.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', true);

// Set locals for access in the views.
app.locals.env = app.get('env');
app.locals.title = 'Todo App';
app.locals.description = 'The most awesome todo app in the world.';

// Middleware stack.
app.use(favicon(__dirname + '/public/icon.png'));
app.use(logger('dev'));
app.use(sassMiddleware({
    src: path.join(__dirname, 'scss'),
    dest: path.join(__dirname, 'public_generated/css'),
    prefix: '/css',
    outputStyle: 'compressed'
}));
app.use(express.static(path.join(__dirname, 'public_generated')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor', express.static(path.join(__dirname, 'bower_components')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api', passport.initialize(), api);
app.use('/', [
    cookieParser(),

    // Configure session store.
    session({
        secret: process.env.SECRET || 'aa2814b45d12c9bdd6f2feaf31b096d6',
        saveUninitialized: false,
        resave: false,
        proxy: true,
        secure: app.get('env') === 'production',
        cookie: {
            path: '/',
            httpOnly: true,
            maxAge: null,
        },
        store: new RedisStore({
            host: process.env.REDIS_PORT_6379_TCP_ADDR,
            port: process.env.REDIS_PORT_6379_TCP_PORT,
            ttl: 86400
        })
    }),

    passport.initialize(),
    passport.session(),

    // Map username to locals.
    function(req, res, next) {
        res.locals.user = req.user;
        return next();
    }
], routes);

// Forward 404 to error handler.
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler
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
    // Connect to database.
    mongoose.connect(process.env.MONGO_URL ||
        ('mongodb://' + (process.env.DB_PORT_27017_TCP_ADDR + ':' +
        process.env.DB_PORT_27017_TCP_PORT + '/todo_app')));
    db.on('open', function() {
        // Create a OAuth client for this app.
        var Client = require('./models/client');
        return Client.findByIdAndUpdateAsync('000000000000000000000000', {
            name: 'Todo Web App',
            redirect_uri: '^\/[^\/]*$',
            secret: 'foo bar baz'
        }, {
            upsert: true,
            new: true
        }).then(function(client) {
            app.set('clientId', client._id);
            resolve(app);
        }).catch(console.log);
    });
    db.on('error', reject);
});
