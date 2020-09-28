var xlsxFileReader = require('read-excel-file/node');

var readFile = (file) => {
    return new Promise((res, rej) => {
        xlsxFileReader(file).then((rows) => {
            res(rows);
        });
    });
}


module.exports = { readFile }