var xlsxFileReader = require('read-excel-file/node');
var db = require('../helpers/database');
var fs = require('fs');
const to = require('../utils/to');

var PARTNER_NAME = 3;
var PARTNER_MOBILE = 4;
var PRODUCT_STATUS = 13;

var readFile = (file) => {
    return new Promise((res, rej) => {
        xlsxFileReader(file).then((rows) => {
            res(rows);
        }).catch((err) => {
            rej(err);
        });
    });
}



var toDB = (filePath, fileName) => {
    return new Promise(async (res, rej) => {
    let rows, err;
    [err,rows] = await to(readFile(filePath));
    if(err) rej(err);
    for (var i=1; i<rows.length; i++) {
        var order = rows[i];
        if (order[PRODUCT_STATUS] != 'Delivered') continue;
        let status;
        [err,status] = await to(db.insertFields(order));
        if(err) rej(err);
        [err, status] = await to(db.calculatePoints());
        if(err) rej(err);
    }
    fs.unlinkSync(__dirname + `/../data/${fileName}`); //delete file from server
    res();
    });
}



module.exports = toDB