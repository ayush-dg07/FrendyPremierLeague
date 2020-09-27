const to = require('../utils/to')
const db= require('../config/connection')
const express = require('express');
const router = express.Router();
const midware = require('../utils/loginMiddleware');

dailyRuns= (user,currDate) => {
    return new Promise( async (res, rej) => {
        let run=0;
        [e,r] = await to(db.query('select sum(amt) as tot_sell from orders where umobile=? and odate=? and is_proc=1',[user.umobile,currDate]));
        [e1,r1] = await to(db.query('select count(*) as cnt from orders inner join product on orders.pid=product.pid where product.is_hnk=1 and orders.umobile=? and orders.odate=? and orders.is_proc=1',[user.mobile,currDate]));
        [e2,r2] = await to(db.query('select count(*) as cnt from orders inner join product on orders.pid=product.pid where product.is_combo=1 and orders.umobile=? and orders.odate=? and orders.is_proc=1',[user.mobile,currDate]));
        run=(r[0].tot_sell/100);
        run+=4*r1[0].cnt; run+=2*r2[0].cnt;
        if(r[0].tot_sell>=5000) run+=6; else if(r[0].tot_sell>=2000) run+=2;
        res(run);
    });
}

dailyRunsWeek= (user,currDate) => {
    return new Promise( async (res, rej) => {
        let e,r,run=0;
        [e,r] = await to(db.query('select sum(amt) as tot_sell_on_day from (select * from orders where umobile=? and weekOfYear(odate)=weekOfYear(?) and year(odate)=year(?) and is_proc=1) as allOrdersInWeek group by odate',[user.umobile,currDate,currDate])); //prices sold on all days of a week by a user
        for(var i=0; i<r.length; i++) {
            run+=(r[i].tot_sell_on_day/100);
            if(r[i].tot_sell_on_day>=5000) run+=6; else if(r[i].tot_sell_on_day>=2000)  run+=2; ;
            //console.log(run);
        }
        res(run);
    });
}




sendUserData = async (req,res) => {
    //daily, weekly, monthly runs
    let e,r,e1,r1,e2,r2;
    let user=req.user;
    
    let currDate = new Date();
    currDate.setTime(currDate.getTime()+330*60*1000); //5 hr 30 min ahead of GMT
    currDate=currDate.toISOString();
    currDate=currDate.slice(0,10);
    //console.log(currDate);

    // let user={                              
    //     umobile: '9924482064',    //dummy user logged in
    // }

    // var currDate = new Date(2020, 9, 5, 12, 00, 30, 0); //dummy date
    // //console.log(currDate);
    // currDate.setTime(currDate.getTime()+330*60*1000);
    // currDate=currDate.toISOString();
    // currDate=currDate.slice(0,10);
    // //console.log(currDate);

    let userData= {}; //response object
    [e,r] = await to(db.query('select * from user where umobile=?',[user.umobile]));
    userData.name=r[0].uname;
    userData.umobile=r[0].umobile;
    userData.totalRuns=r[0].runs;
    userData.combos=r[0].combos;
    userData.hnks=r[0].hnks;
    userData.fours=r[0].fours;
    userData.sixes=r[0].sixes;

    //daily runs
    [e,r] = await to(dailyRuns(user,currDate));
    userData.dailyRuns=r;

    //weekly runs
    let run;
    [e,run]=await to(dailyRunsWeek(user,currDate));
    [e,r] = await to(db.query('select sum(amt) as tot_sell from orders where umobile=? and weekOfYear(odate)=weekOfYear(?) and year(orders.odate)=year(?) and is_proc=1',[user.umobile,currDate,currDate]));
    [e1,r1] = await to(db.query('select count(*) as cnt from orders inner join product on orders.pid=product.pid where product.is_hnk=1 and orders.umobile=? and weekOfYear(orders.odate)=weekOfYear(?) and year(orders.odate)=year(?) and orders.is_proc=1', [user.mobile,currDate,currDate]));
    [e2,r2] = await to(db.query('select count(*) as cnt from orders inner join product on orders.pid=product.pid where product.is_combo=1 and orders.umobile=? and weekOfYear(orders.odate)=weekOfYear(?) and year(orders.odate)=year(?) and orders.is_proc=1', [user.mobile,currDate,currDate]));
    run+=4*r1[0].cnt; run+=2*r2[0].cnt;
    if(r[0].tot_sell>=10000) run+=6; else if(r[0].tot_sell>=5000) run+=4;
    userData.weeklyRuns=run;

    res.send(userData);

}

router.get('/api', midware.redirectLogin, sendUserData); //sending user stats
router.get('/' , midware.redirectLogin, (req, res) => {
    res.render('profile');
});

module.exports = router;

