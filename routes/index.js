var express = require('express');
var router = express.Router();
var file = require('../helpers/fileHandling');
var upload = require('./upload');
const user= require('./user');
const scores= require('./scores');

router.use('/upload', upload); //excel upload
router.use('/user', user);  //user profile
router.use('/',scores);   //leaderboard

module.exports = router;