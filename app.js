var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin')
var model = require('./model/index')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')))

// 设置session

app.use( session({
    secret: 'keyboard cat',
    cookie: ('name', 'value', { path: '/', httpOnly: true, secure: false})
}) )
app.use(function(req, res, next){
    req.session._garbage = Date();
    req.session.touch();
    next();
});
app.use('/', index);
app.use('/users', function (req, res, next) {
    if ( !req.session.client_login ) {
        res.send(JSON.stringify({status: 'client_nologin'}))
    } else {
        next()
    }
})
app.use('/users', users);
//admin操作下需登录， 设置yanz登录中间件
// app.use('/admin', function (req, res, next) {
//     if ( !req.session.admin_Login ) {
//       res.send(JSON.stringify({status: 'nologin'}))
//     } else {
//       next()
//     }
// })
app.use('/admin', admin)



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);

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
