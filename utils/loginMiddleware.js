const { promiseImpl } = require("ejs");

const redirectLogin = (req, res, next) => {
    if(!req.user) return res.redirect('/');
    next();
}

const redirectHome = (req, res, next) => {
    if(req.user) return res.redirect('/scores');
    next();
}

const isAdmin = (req, res, next) => {
    if(!req.user.isAdmin || req.user.isAdmin==0) return res.redirect('/scores');
    next();
}

const isNotAdmin = (req, res, next) => {  // to avoid user page for admin
    if(req.user.isAdmin==1) return res.redirect('/scores');
    next();
}

//if user tries to view profile without entering mobile number:
const isRegistered = (req, res, next) => {
    if(!req.user) {  return res.redirect('/'); }
    else if(!req.user.umobile) {  return res.redirect('/auth/mobile'); }
    next();
}


module.exports = {redirectLogin, redirectHome, isAdmin, isNotAdmin, isRegistered};
