const router=require('express').Router();
const passport=require('passport');
const to = require('../utils/to');
const db = require('../config/connection');
const midware = require('../utils/loginMiddleware');


router.get('/google', midware.redirectHome, passport.authenticate('google', {
    scope: ['profile']
}   
));

router.get('/google/redirect', passport.authenticate('google', {failureRedirect: "/"}),async (req,res)=> {
    if(!req.user) res.redirect('/');
    if(!req.user.umobile) { //need to take mobile number
        res.redirect('/auth/mobile');
    }
    else res.redirect('/scores');
});

router.get('/mobile', midware.redirectLogin, async (req,res) => {
    if(req.user.umobile) return res.redirect('/scores'); 
    let msg='';
    res.render('mobileForm',{msg});
});

router.post('/mobile', async (req,res) => { //add middleware
    const umobile= req.body.umobile;
    let e,r;
    [e,r] = await to(db.query('select * from user where umobile=?',[umobile]));
    if(r.length==0) {
        let msg = 'Mobile Number not registered with Frendy';
        return res.render('mobileForm',{msg})
    }
    [e,r] =  await to(db.query('update userLogin set umobile=? where gid=?',[umobile,req.user.gid]));
    req.user.umobile=umobile;
    res.redirect('/scores');
})

router.get('/logout',midware.redirectLogin,(req,res)=> {
    req.logout();
    return res.redirect('/');
});

module.exports=router;