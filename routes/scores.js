//routes for score overall scores page
var express = require('express');
var router = express.Router();
const to = require('../utils/to');
const db = require('../config/connection');
const midware = require('../utils/loginMiddleware');
const { render } = require('ejs');

dailyScoresWeek2= (arr, n, currDate) => {
    return new Promise( async (res, rej) => {
        let e,r; arr[n].runs=0;
        arr[n].sixes=0; arr[n].fours=0;
        [e,r] = await to(db.query('select sum(amt) as tot_sell_on_day from (select * from orders where umobile=? and weekOfYear(odate)=weekOfYear(?) and year(odate)=year(?) and is_proc=1) as allOrdersInWeek group by odate',[arr[n].umobile,currDate,currDate])); //prices sold on all days of a week by a user
        for(var i=0; i<r.length; i++) {
            arr[n].runs+=(r[i].tot_sell_on_day/100);
            if(r[i].tot_sell_on_day>=5000) { arr[n].runs+=6; arr[n].sixes++; } else if(r[i].tot_sell_on_day>=2000) { arr[n].runs+=2; }
        }
        res();
    });
}

dailyRunsMonth2 = (user,currDate,weekNo,weekStat) => {
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

weeklyRunsMonth2 = (arr,i,currDate,weekNo) => {
    return new Promise ( async(res, rej) => {
        let user= { umobile: arr[i].umobile };
        let weekStat = { run:0, sixes:0 ,fours:0 };
        let e,r,e1,r1,e2,r2;
        await dailyRunsMonth2(user,currDate,weekNo,weekStat);
        [e,r] = await to(db.query('select sum(amt) as tot_sell from orders where umobile=? and weekOfYear(odate)=? and month(odate)=month(?) and year(orders.odate)=year(?) and is_proc=1',[user.umobile,weekNo,currDate,currDate]));
        [e1,r1] = await to(db.query('select count(*) as cnt from orders inner join product using(pid) where product.is_hnk=1 and orders.umobile=? and weekOfYear(odate)=? and month(odate)=month(?) and year(odate)=year(?) and orders.is_proc=1', [user.umobile,weekNo,currDate,currDate]));
        [e2,r2] = await to(db.query('select count(*) as cnt from orders inner join product using(pid) where product.is_combo=1 and orders.umobile=? and weekOfYear(odate)=? and month(odate)=month(?) and year(odate)=year(?) and orders.is_proc=1', [user.umobile,weekNo,currDate,currDate]));
        if(r1.length>0) { weekStat.run+=4*r1[0].cnt; weekStat.fours+=r1[0].cnt; }  if(r2.length>0) { weekStat.run+=2*r2[0].cnt; }
        if(r.length>0) {
            if(r[0].tot_sell>=10000) { weekStat.run+=6; weekStat.sixes++; } 
            else if(r[0].tot_sell>=5000) { weekStat.run+=4; weekStat.fours++; }
        }
        //console.log(weekNo,weekStat);
        arr[i].run+=weekStat.run;
        arr[i].sixes+=weekStat.sixes;
        arr[i].fours+=weekStat.fours;
        res();
    })
}





sendScores = async (req,res) => {
    let scoreData={};
    let e,r;
    [e,r] = await to(db.query('select uname,runs from user order by runs desc, sixes desc, fours desc limit 10'));
    scoreData.byRunsSeries=r;
    [e,r] = await to(db.query('select uname,sixes from user order by sixes desc, runs desc, fours desc limit 10'));
    scoreData.bySixesSeries=r;
    [e,r] = await to(db.query('select uname,fours from user order by fours desc, runs desc, sixes desc limit 10'));
    scoreData.byFoursSeries=r;

    let currDate = new Date();
    currDate.setTime(currDate.getTime()+330*60*1000); //5 hr 30 min ahead of GMT
    currDate=currDate.toISOString();
    currDate=currDate.slice(0,10);
    //console.log(currDate);

    // var currDate = new Date(2020, 9, 5, 12, 00, 30, 0); //dummy date
    // //console.log(currDate);
    // currDate.setTime(currDate.getTime()+330*60*1000);
    // currDate=currDate.toISOString();
    // currDate=currDate.slice(0,10);
    // //console.log(currDate);

    //daily scores
    [e,r] = await to(db.query('select umobile,uname,sum(amt) as totDay from orders inner join user using(umobile) where odate=? group by umobile,uname',[currDate])); //total sold on a date by every user, also showing name
    
    for(var i=0; i<r.length; i++) {
        let totDay = r[i].totDay;
        r[i].runs=r[i].totDay/100;
        r[i].sixes=0; r[i].fours=0;
        //add daily price bonuses
        if(totDay>=5000) { r[i].runs+=6; r[i].sixes++; }
        else if(totDay>=2000) r[i].runs+=2;
        //add daily product bonuses
        let e1,r1;
        [e1,r1] = await to(db.query('select count(*) as numBonus from orders inner join product using(pid) where odate=? and is_hnk=1 and umobile=?',[currDate,r[i].umobile])); //no of bonuses by a user on a date
        if(r1.length>0) { r[i].runs+=4*r1[0].numBonus; r[i].fours+=r1[0].numBonus; }
        [e1,r1] = await to(db.query('select count(*) as numBonus from orders inner join product using(pid) where odate=? and is_combo=1 and umobile=?',[currDate,r[i].umobile])); //no of bonuses by a user on a date
        if(r1.length>0) r[i].runs+=2*r1[0].numBonus;
    }
    //daily runs
    r.sort((a,b)=>(a.runs<b.runs) ? 1:-1);  //what to do if tie occurs
    scoreData.byRunsDaily=[];
    for(var i=0; i<r.length && i<10; i++) {
        scoreData.byRunsDaily.push({
            uname: r[i].uname,
            runs: r[i].runs
        })
    }
    //daily sixes
    r.sort((a,b)=>(a.sixes<b.sixes) ? 1:-1);
    scoreData.bySixesDaily=[];
    for(var i=0; i<r.length && i<10; i++) {
        scoreData.bySixesDaily.push({
            uname: r[i].uname,
            sixes: r[i].sixes
        })
    }
    //daily fours
    scoreData.byFoursDaily=[];
    r.sort((a,b)=>(a.fours<b.fours) ? 1:-1);
    for(var i=0; i<r.length && i<10; i++) {
        scoreData.byFoursDaily.push({
            uname: r[i].uname,
            fours: r[i].fours
        })
    }


    //weekly scores
    //find all users who have made a sale this week
    [e,r] = await to(db.query('select distinct umobile,uname from orders inner join user using(umobile) where weekOfYear(odate)=weekOfYear(?) and year(odate)=year(?)',[currDate,currDate]));
    for(var i=0; i<r.length; i++) {
        await dailyScoresWeek2(r,i,currDate);
        let e1,r1;
        [e1,r1] = await to(db.query('select sum(amt) as totWeek from orders where umobile=? and weekOfYear(odate)=weekOfYear(?) and year(orders.odate)=year(?) and is_proc=1',[r[i].umobile,currDate,currDate]));
        if(r1[0].totWeek>=10000) { r[i].runs+=6; r[i].sixes++; }
        else if(r1[0].totWeek>=5000) { r[i].runs+=4; r[i].fours++; }
        [e1,r1] = await to(db.query('select count(*) as cnt from orders inner join product on orders.pid=product.pid where product.is_hnk=1 and orders.umobile=? and weekOfYear(orders.odate)=weekOfYear(?) and year(orders.odate)=year(?) and orders.is_proc=1', [r[i].umobile,currDate,currDate]));
        if(r1.length>0) { r[i].run+=r1[0].cnt*4; r[i].fours+=r1[0].cnt; }
        [e1,r1] = await to(db.query('select count(*) as cnt from orders inner join product on orders.pid=product.pid where product.is_combo=1 and orders.umobile=? and weekOfYear(orders.odate)=weekOfYear(?) and year(orders.odate)=year(?) and orders.is_proc=1', [r[i].umobile,currDate,currDate]));
        if(r1.length>0) { r[i].run+=r1[0].cnt*2; }
    }
    //weekly runs
    r.sort((a,b)=>(a.runs<b.runs) ? 1:-1);
    scoreData.byRunsWeekly=[];
    for(var i=0; i<r.length && i<10; i++) {
        scoreData.byRunsWeekly.push({
            uname: r[i].uname,
            runs: r[i].runs
        })
    }
    //weekly sixes
    r.sort((a,b)=>(a.sixes<b.sixes) ? 1:-1);
    scoreData.bySixesWeekly=[];
    for(var i=0; i<r.length && i<10; i++) {
        scoreData.bySixesWeekly.push({
            uname: r[i].uname,
            sixes: r[i].sixes
        })
    }
    //weekly fours
    r.sort((a,b)=>(a.fours<b.fours) ? 1:-1);
    scoreData.byFoursWeekly=[];
    for(var i=0; i<r.length && i<10; i++) {
        scoreData.byFoursWeekly.push({
            uname: r[i].uname,
            fours: r[i].fours
        })
    }

    
    //monthly stats
    [e,r] = await to(db.query('select weekOfYear(?) as currWeek',[currDate]));
    [e1,r1] = await to(db.query('select weekOfYear(firstDay) as firstWeek from (select date_sub(?,interval dayofmonth(?)-1 day) as firstDay) as firstDay',[currDate,currDate]));
    let currWeek = r[0].currWeek, firstWeek= r1[0].firstWeek;
    //all users who have made sales this month
    [e,r] = await to(db.query('select distinct uname,umobile from user inner join orders using(umobile) where month(odate)=month(?) and year(odate)=year(?)',[currDate, currDate]));
    for(var i=0;i<r.length;i++) { //for all users
        r[i].run=0; r[i].fours=0; r[i].sixes=0;
        for(var j=firstWeek; j<=currWeek; j++) {  //for all weeks
            await weeklyRunsMonth2(r,i,currDate,j);
        }
    }

    //monthly runs
    r.sort((a,b)=>(a.run<b.run) ? 1:-1);
    scoreData.byRunsMonthly=[];
    for(var i=0; i<r.length && i<10; i++) {
        scoreData.byRunsMonthly.push({
            uname: r[i].uname,
            runs: r[i].run
        })
    }
    //monthly sixes
    r.sort((a,b)=>(a.sixes<b.sixes) ? 1:-1);
    scoreData.bySixesMonthly=[];
    for(var i=0; i<r.length && i<10; i++) {
        scoreData.bySixesMonthly.push({
            uname: r[i].uname,
            sixes: r[i].sixes
        })
    }
    //monthly fours
    r.sort((a,b)=>(a.fours<b.fours) ? 1:-1);
    scoreData.byFoursMonthly=[];
    for(var i=0; i<r.length && i<10; i++) {
        scoreData.byFoursMonthly.push({
            uname: r[i].uname,
            fours: r[i].fours
        })
    }
    let scoreToSend={};

    if(req.params.cat && req.params.filter){
        var cat=req.params.cat;
        var filter=req.params.filter;
        if(cat=="total"){

            if(filter=="month"){
                scoreToSend.byRunsSeries=scoreData.byRunsMonthly;
            }
            else if(filter=="sixes"){
                scoreToSend.byRunsSeries=scoreData.bySixesSeries;
            }
            else if(filter=="fours"){
                scoreToSend.byRunsSeries=scoreData.byFoursSeries;
            }
            else if(filter=="week"){
                scoreToSend.byRunsSeries=scoreData.byRunsWeekly;
            }
            else if(filter=="day"){
                scoreToSend.byRunsSeries=scoreData.byRunsDaily;
            }
            else{
                scoreToSend.byRunsSeries=scoreData.byRunsSeries;
            }
            console.log("total");
            
            return res.render("scores",{scores:scoreToSend});
        }

        if(cat=="daily"){

           
            if(filter=="sixes"){
                scoreToSend.byRunsSeries=scoreData.bySixesDaily;
            }
            else if(filter=="fours"){
                scoreToSend.byRunsSeries=scoreData.byFoursDaily;
                console.log(scoreToSend.byRunsSeries);

            }
          
            else if(filter=="day"){
                scoreToSend.byRunsSeries=scoreData.byRunsDaily;
            }
            else{
                scoreToSend.byRunsSeries=scoreData.byRunsDaily;
            }
            console.log("Daily");
            
            return res.render("daily",{scores:scoreToSend});
        }

        else if(cat=="weekly"){

            if(filter=="week"){
                scoreToSend.byRunsSeries=scoreData.byRunsWeekly;
            }
            else if(filter=="sixes"){
                scoreToSend.byRunsSeries=scoreData.bySixesWeekly;
            }
            else if(filter=="fours"){
                scoreToSend.byRunsSeries=scoreData.byFoursWeekly;
            }
         
            else{
                scoreToSend.byRunsSeries=scoreData.byRunsWeekly;
            }
            console.log("weekly");
            return res.render("weekly",{scores:scoreToSend});
        }

        else if(cat=="monthly"){

            if(filter=="month"){
                scoreToSend.byRunsSeries=scoreData.byRunsMonthly;
            }
            else if(filter=="sixes"){
                scoreToSend.byRunsSeries=scoreData.bySixesMonthly;
            }
            else if(filter=="fours"){
                scoreToSend.byRunsSeries=scoreData.byFoursMonthly;
            }
         
            else{
                scoreToSend.byRunsSeries=scoreData.byRunsMonthly;
            }
            console.log("monthly");
            return res.render("monthly",{scores:scoreToSend});
        }
        else{
            
            return res.render("scores",{scores:scoreToSend});


        }
       
            
        
    }


    
    //todo -> calc scores from only processed orders
    // res.send(scoreData);
    return res.render("scores",{scores:scoreData});
}
router.get("/:cat/:filter",midware.redirectLogin,sendScores);
router.get('/api', midware.redirectLogin, sendScores); //api route to fetch score leaderboard
router.get('/', midware.redirectLogin,sendScores
//  async (req,res) => {
//     res.render('scores');
// }
)

module.exports = router;