var xlsxFileReader = require('read-excel-file/node');
var db = require('../helpers/database');
var fs = require('fs');
const to = require('../utils/to');

var PARTNER_NAME = 3;
var PARTNER_MOBILE = 4;
var PRODUCT_STATUS = 13;
const date=14;

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
    let dates=[];
    [err,rows] = await to(readFile(filePath)); //read excel file
    if(err) rej(err);
    for (var i=1; i<rows.length; i++) {
        var order = rows[i];
        if (order[PRODUCT_STATUS] != 'Delivered') continue; //dont process cancelled orders
        //date manipulation
        if(typeof order[date].getMonth === 'function') {
        const offset=12*60*60*1000; //12 hours is getting added to date from some reason- subtracting 12 hours
        await order[date].setTime(order[date].getTime()-offset);
        order[date]=await (order[date].toISOString());
        }
        order[date]=await (order[date].slice(0,10));  //changing to only date string
        if(!dates.includes(order[date])) {
            dates.push(order[date]); //keeping track of dates to be processed
        }
        
        let status;
        [err,status] = await to(db.insertFields(order)); //insert fields
        if(err) rej(err);
    }
    [err, status] = await to(db.updatePoints(dates));  //calculate points for newly inserted fields
    if(err) rej(err);
    fs.unlinkSync(__dirname + `/../data/${fileName}`); //delete file from server
    res();
    });
}



module.exports = toDB