var xlsxFileReader = require('read-excel-file/node');
var db = require('../helpers/database');
var fs = require('fs');

var PARTNER_NAME = 3;
var PARTNER_MOBILE = 4;
var PRODUCT_STATUS = 13;

var readFile = (file) => {
    return new Promise((res, rej) => {
        xlsxFileReader(file).then((rows) => {
            res(rows);
        });
    });
}

var toDB = (filePath, fileName) => {
    return new Promise((res, rej) => {
        readFile(filePath).then(async rows => {

            for (var i = 1; i < rows.length; i++) {
                var order = rows[i];
                if (order[PRODUCT_STATUS] != 'Delivered') continue;
                await db.verifyPartner(order[PARTNER_NAME], order[PARTNER_MOBILE]).then(status => {
                    if (status) {
                        db.insertFields(order).then(s => {
                            if (!s) console.error("Invalid Field Encountered");
                        });
                    } else {
                        console.error("Something is wrong with server");
                    }
                });
            }
            return fileName;
        }).then((fileName) => {
            fs.unlink(__dirname + `/../data/${fileName}`, () => {
                console.log("Records Added")
            });
            db.calculatePoints().then(() => {
                console.log("calp")
                res();
            });
        });
    });
}


module.exports = toDB