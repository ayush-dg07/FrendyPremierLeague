// columns index values
var ORDER_ID = 6;
var PRODUCT_ID = 7;
var PRODUCT_NAME = 8;
var PRICE = 12;

var insertFields = (order) => {
    return new Promise((res, rej) => {
        // mysql code for inserting fields
        // order is the row from the file
        console.log(order);
    });
}

var createPartner = (name, mobile) => {
    return new Promise((res, rej) => {
        // mysql code for creating new partner
    });
}

var checkPartner = (mobile) => {
    return new Promise((res, rej) => {
        // mysql code for verifying if a partner exists

        res(true);
    });
}


var verifyPartner = (name, mobile) => {
    return new Promise((res, rej) => {
        checkPartner(mobile).then(status => {
            if (status) res(true);
            else {
                createPartner(name, mobile).then(status => {
                    if (status) res(true);
                    else res(false);
                });
            }
        });
    });
}

var calculatePoints = () => {
    return new Promise((res, rej) => {
        // mysql code for calculating points for each user
    });
}

module.exports = { verifyPartner, insertFields, calculatePoints }