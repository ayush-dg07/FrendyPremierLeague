var express = require('express');
var router = express.Router();
var file = require('../helpers/fileHandling');
const upload = require('./upload');
const user= require('./user');
const scores= require('./scores');
const auth = require('./auth');
const midware = require('../utils/loginMiddleware');

router.use('/upload', upload); //excel upload
router.use('/user', user);  //user profile
router.use('/scores',scores);   //leaderboard
router.use('/auth', auth); //auth routes

router.get('/', midware.redirectHome, (req,res) => { //homepage
    res.render('loginForm'); 
});

module.exports = router;