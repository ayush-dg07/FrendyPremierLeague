// columns index values
var ORDER_ID = 6;
var PRODUCT_ID = 7;
var PRODUCT_NAME = 8;
var PRICE = 12;

var insertFields = (order) => {
    return new Promise(async (res, rej) => {
        //insert new fields from incoming data
        //console.log(order);
        res();
    });
}

var calculatePoints = () => {
    return new Promise(async (res, rej) => {
        //calculating points for newly entered fields
        res();
    });
}

module.exports = {insertFields, calculatePoints }