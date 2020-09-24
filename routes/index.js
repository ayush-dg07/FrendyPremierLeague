var express = require('express');
var router = express.Router();
var file = require('../helpers/fileHandling');
var upload = require('./upload');

router.get('/', (req, res) => {
    file.readFile('data/users.xlsx').then(rows => {
        res.render('scores', { scores: rows });
    });
});

router.use('/upload', upload);

module.exports = router;