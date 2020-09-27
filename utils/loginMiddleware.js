const { promiseImpl } = require("ejs");

const redirectLogin = (req, res, next) => {
    if(!req.user) return res.redirect('/');
    next();
}

const redirectHome = (req, res, next) => {
    if(req.user) return res.redirect('/scores');
    next();
}

module.exports = {redirectLogin, redirectHome};
