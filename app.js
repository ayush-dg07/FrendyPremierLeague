var express = require('express');
var app = express();
var routes = require('./routes/index');
var parser = require('body-parser');
var upload = require("express-fileupload")
const session = require('express-session');
const passport=require('passport');
const passportConfig= require('./config/passport');


var port = process.env.port || 3000;

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(upload());

app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: "secret-key",
      cookie: { maxAge: 604800000 }
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

//todo - add login middleware
app.listen(port, () => {
    console.log("Server is Online!");
});
