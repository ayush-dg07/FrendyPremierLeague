const passport=require('passport');
const googleStrategy=require('passport-google-oauth20');
const key=require('./key');
const db = require('./connection');
const to = require ('../utils/to');

passport.serializeUser( (user,done) => {
    return done(null,user.gid);    
});

passport.deserializeUser( async (id, done) => {
    let err, res;
    [err, res] = await to(db.query('select * from userLogin where gid=?',[id]));
    return done(null,res[0]);
});

passport.use( 
    new googleStrategy({
        callbackURL: '/auth/google/redirect',
        clientID: key.google.clientID,
        clientSecret: key.google.clientSecret
    }, async function (accessToken,refreshToken,profile,done) {
        //insert into DB
        let e,r;
        [e,r]= await to(db.query('select * from userLogin where gid=?',[profile.id]));
        if(r.length==0) { //first time user
            let e1,r1;
            [e1, r1]= await to(db.query('insert into userLogin(gid,isAdmin) values(?,?)',
            [profile.id,false]));
            if(e1) { return done(e1); }
        }
        let user;
        [e, user]=await to(db.query('select * from userLogin where gid=?',[profile.id]));
        done(null,user[0]);  
    })
)