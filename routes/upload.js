var express = require('express');
var router = express.Router();
var toDB = require('../helpers/fileToDb');
const to = require('../utils/to');
const midware = require('../utils/loginMiddleware');

router.get('/', midware.redirectLogin, midware.isAdmin, (req, res) => {
    res.render('upload');
});


router.post('/', midware.redirectLogin, midware.isAdmin, async (req, res) => { //route for entering new data
    var file = req.files.file;
    let err,status;
    [err,status] = await to(file.mv(__dirname + `/../data/${file.name}`)); //file upload
    if(err) console.log(err+ ' problem in file uploading');
    [err,status] = await to(toDB(`data/${file.name}`, file.name)); //database updation
    if(err) console.log(err+ ' problem in database insertion');
    res.send("done");
})

module.exports = router;