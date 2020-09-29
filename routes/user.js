const to = require('../utils/to')
const db= require('../config/connection')
const express = require('express');
const router = express.Router();
const midware = require('../utils/loginMiddleware');

dailyRuns= (user,currDate) => {
    return new Promise( async (res, rej) => {
        let stat ={ run:0, sixes:0, fours:0 }
        let e,r,e1,r1,e2,r2;
        [e,r] = await to(db.query('select sum(amt) as tot_sell from orders where umobile=? and odate=? and is_proc=1',[user.umobile,currDate]));
        [e1,r1] = await to(db.query('select count(*) as cnt from orders inner join product on orders.pid=product.pid where product.is_hnk=1 and orders.umobile=? and orders.odate=? and orders.is_proc=1',[user.umobile,currDate]));
        [e2,r2] = await to(db.query('select count(*) as cnt from orders inner join product on orders.pid=product.pid where product.is_combo=1 and orders.umobile=? and orders.odate=? and orders.is_proc=1',[user.umobile,currDate]));
        if(r.length>0) { 
            stat.run+=(r[0].tot_sell/100);
            if(r[0].tot_sell>=5000) { stat.run+=6; stat.sixes++; } else if(r[0].tot_sell>=2000) { stat.run+=2; }
        }
        if(r1.length>0) { stat.run+=4*r1[0].cnt; stat.fours+=r1[0].cnt; }
        if(r2.length>0) { stat.run+=2*r2[0].cnt; }
        
        res(stat);
    });
}

dailyRunsWeek= (user,currDate,weekStat) => {
    return new Promise( async (res, rej) => {
        let e,r; 
        [e,r] = await to(db.query('select sum(amt) as tot_sell_on_day from (select * from orders where umobile=? and weekOfYear(odate)=weekOfYear(?) and year(odate)=year(?) and is_proc=1) as allOrdersInWeek group by odate',[user.umobile,currDate,currDate])); //prices sold on all days of a week by a user
        for(var i=0; i<r.length; i++) {
            weekStat.run+=(r[i].tot_sell_on_day/100);
            if(r[i].tot_sell_on_day>=5000) { weekStat.run+=6; weekStat.sixes++; } else if(r[i].tot_sell_on_day>=2000)  weekStat.run+=2; ;
            //console.log(run);
        }
        res();
    });
}

dailyRunsMonth = (user,currDate,weekNo,weekStat) => {
    return new Promise( async(res, rej) => {
        let e,r; 
        [e,r] = await to(db.query('select sum(amt) as tot_sell_on_day from (select * from orders where umobile=? and weekOfYear(odate)=? and month(odate)=month(?) and year(odate)=year(?) and is_proc=1) as allOrdersInWeek group by odate',[user.umobile,weekNo,currDate,currDate])); //prices sold on all days of a week by a user
        for(var i=0; i<r.length; i++) {
            weekStat.run+=(r[i].tot_sell_on_day/100);
            if(r[i].tot_sell_on_day>=5000) { weekStat.run+=6; weekStat.sixes++; } else if(r[i].tot_sell_on_day>=2000)  weekStat.run+=2; ;
            //console.log(run);
        }
        res();
    })
}


weeklyRunsMonth = (user,currDate,weekNo,monthStat) => {
    return new Promise( async (res, rej) => {
        let weekStat = { run:0, sixes:0 ,fours:0 };
        let e,r,e1,r1,e2,r2;
        [e,r]=await to(dailyRunsMonth(user,currDate,weekNo,weekStat));
        [e,r] = await to(db.query('select sum(amt) as tot_sell from orders where umobile=? and weekOfYear(odate)=? and month(odate)=month(?) and year(orders.odate)=year(?) and is_proc=1',[user.umobile,weekNo,currDate,currDate]));
        [e1,r1] = await to(db.query('select count(*) as cnt from orders inner join product using(pid) where product.is_hnk=1 and orders.umobile=? and weekOfYear(odate)=? and month(odate)=month(?) and year(odate)=year(?) and orders.is_proc=1', [user.umobile,weekNo,currDate,currDate]));
        [e2,r2] = await to(db.query('select count(*) as cnt from orders inner join product using(pid) where product.is_combo=1 and orders.umobile=? and weekOfYear(odate)=? and month(odate)=month(?) and year(odate)=year(?) and orders.is_proc=1', [user.umobile,weekNo,currDate,currDate]));
        if(r1.length>0) { weekStat.run+=4*r1[0].cnt; weekStat.fours+=r1[0].cnt; }  if(r2.length>0) { weekStat.run+=2*r2[0].cnt; }
        if(r.length>0) {
            if(r[0].tot_sell>=10000) { weekStat.run+=6; weekStat.sixes++; } 
            else if(r[0].tot_sell>=5000) { weekStat.run+=4; weekStat.fours++; }
        }
        //console.log(weekNo,weekStat);
        monthStat.run+=weekStat.run;
        monthStat.sixes+=weekStat.sixes;
        monthStat.fours+=weekStat.fours;
        res();
    })
}




sendUserData = async (req,res) => {
    //daily, weekly, monthly runs
    let e,r,e1,r1,e2,r2;
    let user=req.user;
    //console.log(req.user);
    if(!user.umobile || user.isAdmin==1) return res.send({error: 'No mobile number given'});  //if user hasn't entered phone number
    let currDate = new Date();
    currDate.setTime(currDate.getTime()+330*60*1000); //5 hr 30 min ahead of GMT
    currDate=currDate.toISOString();
    currDate=currDate.slice(0,10);
    console.log(currDate);

    // let user={                              
    //     umobile: '9924482064',    //dummy user logged in
    // }

    // var currDate = new Date(2020, 10, 30, 12, 00, 30, 0); //dummy date
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
    userData.totalCombos=r[0].combos;
    userData.totalHnks=r[0].hnks;
    userData.totalFours=r[0].fours;
    userData.totalSixes=r[0].sixes;

    //daily runs
    [e,r] = await to(dailyRuns(user,currDate));
    userData.dailyRuns=r.run;
    userData.dailySixes=r.sixes;
    userData.dailyFours=r.fours;

    //weekly runs
    let weekStat = { run:0, sixes:0 ,fours:0 };
    [e,r]=await to(dailyRunsWeek(user,currDate,weekStat));
    [e,r] = await to(db.query('select sum(amt) as tot_sell from orders where umobile=? and weekOfYear(odate)=weekOfYear(?) and year(orders.odate)=year(?) and is_proc=1',[user.umobile,currDate,currDate]));
    [e1,r1] = await to(db.query('select count(*) as cnt from orders inner join product on orders.pid=product.pid where product.is_hnk=1 and orders.umobile=? and weekOfYear(orders.odate)=weekOfYear(?) and year(orders.odate)=year(?) and orders.is_proc=1', [user.umobile,currDate,currDate]));
    [e2,r2] = await to(db.query('select count(*) as cnt from orders inner join product on orders.pid=product.pid where product.is_combo=1 and orders.umobile=? and weekOfYear(orders.odate)=weekOfYear(?) and year(orders.odate)=year(?) and orders.is_proc=1', [user.umobile,currDate,currDate]));
    
    if(r1.length>0) { weekStat.run+=4*r1[0].cnt; weekStat.fours+=r1[0].cnt; }  if(r2.length>0) { weekStat.run+=2*r2[0].cnt; }
    if(r.length>0) {
        if(r[0].tot_sell>=10000) { weekStat.run+=6; weekStat.sixes++; } 
        else if(r[0].tot_sell>=5000) { weekStat.run+=4; weekStat.fours++; }
    }
    userData.weeklyRuns=weekStat.run;
    userData.weeklySixes=weekStat.sixes;
    userData.weeklyFours=weekStat.fours;
    
    //monthly stats
    [e,r] = await to(db.query('select weekOfYear(?) as currWeek',[currDate]));
    [e1,r1] = await to(db.query('select weekOfYear(firstDay) as firstWeek from (select date_sub(?,interval dayofmonth(?)-1 day) as firstDay) as firstDay',[currDate,currDate]));
    let currWeek = r[0].currWeek, firstWeek= r1[0].firstWeek;
    let monthStat = { run:0, sixes: 0, fours: 0 };
    for(var i=firstWeek; i<=currWeek; i++) {  //for all weeks
        await weeklyRunsMonth(user,currDate,i,monthStat);
    }
    userData.monthlyRuns=monthStat.run;
    userData.monthlyFours=monthStat.fours;
    userData.monthlySixes=monthStat.sixes;


    return res.render("user",{user:userData});
    //res.send(userData);

}

router.get('/api',  midware.isRegistered, midware.isNotAdmin, sendUserData); //sending user stats
router.get('/' ,  midware.isRegistered,  midware.isNotAdmin, (req, res) => {
    res.render('profile');
});

module.exports = router;

