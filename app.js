var express = require('express');
var app = express();
var routes = require('./routes/index');
var parser = require('body-parser');
var upload = require("express-fileupload")

var port = process.env.port || 3000;

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(upload());

app.use('/', routes);

app.listen(port, () => {
    console.log("Server is Online!");
});
