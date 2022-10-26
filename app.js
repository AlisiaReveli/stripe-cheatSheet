const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
require('dotenv').config();

const indexRouter = require('./routes');
const app = express();
let port = process.env.PORT;

app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(port, () => {
    console.log(`I am listening ${port}!`);
});

module.exports = app;
