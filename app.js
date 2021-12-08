//////////////////
// load modules //
//////////////////

// http-errors
var createError = require('http-errors');

// express
var express = require('express');

//path
var path = require('path');

// cookie-parser
var cookieParser = require('cookie-parser');

// morgan
var logger = require('morgan');


// define router
var homeRouter = require('./routes/1_home');
var editRouter = require('./routes/2_edit');
var validFilesRouter = require('./routes/3_validFiles');

// define app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// set routes
app.use('/', homeRouter);
app.use('/home', homeRouter);
app.use('/edit', editRouter);
app.use('/validFiles', validFilesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
