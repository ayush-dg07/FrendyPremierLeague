var express = require('express');
var router = express.Router();
var toDB = require('../helpers/fileToDb');

router.get('/', (req, res) => {
    res.render('upload');
});

router.post('/', (req, res) => {
    var file = req.files.file;
    file.mv(__dirname + `/../data/${file.name}`).then(r => {
        toDB(`data/${file.name}`, file.name);
        res.send("done");
    });
})

module.exports = router;