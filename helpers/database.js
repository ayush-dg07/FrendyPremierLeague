// columns index values
const uname=3;
const umobile=4;
const oid=6;
const pid=7;
const pname=8;
const category=9;
const amt=12;
const status=13;
const date=14;

const to = require('../utils/to');
const db = require('../config/connection');


var insertFields = (order) => {
    return new Promise(async (res, rej) => {
        //check if user present and add to user table
        let e,r;
        [e,r] = await to(db.query('select * from user where umobile=?',[order[umobile]]));
        if(e) console.log(e);
        if(r.length==0) {
            await db.query('insert into user values(?,?,?,?,?,?,?)',[order[umobile],order[uname],0.00,0,0,0,0]);
        }

        //add to product table
        [e,r] = await to(db.query('select * from product where pid=?',order[pid]));
        if(e) console.log(e);
        let combo=false,hnk=false;
        if(order[category]=='Home and Kitchen') hnk=true; 
        if(order[category]=='Combo') combo=true; 
        if(r.length==0) {
            await db.query('insert into product values(?,?,?,?)',[order[pid],order[pname],combo,hnk]);
        }

        //add to orders table
        [e,r] = await to(db.query('select * from orders where oid=? and pid=?',[order[oid],order[pid]])); //to avoid duplicates
        if(r.length==0) { 
        await db.query('insert into orders values(?,?,?,?,?,?)',[order[oid],order[pid],order[umobile],order[amt],order[date],false]);
        }
        res();
       
    });
}

var updatePoints = (dates) => {
    return new Promise(async (res, rej) => {
        let doneWeeks = [];
        for(var i=0;i<dates.length;i++) {//for each new date that was added

            //update daily normal points and daily bonus
            let e,r;
            [e,r] = await to(db.query('select umobile,sum(amt) as tot_sell from (select * from orders where odate=? and is_proc=false) as ordersOnDate group by umobile',[dates[i]]));
            if(e) console.log(e);
            for(var j=0;j<r.length;j++) {
                //daily normal points
                let run = (r[j].tot_sell/100); //new runs scored on that day
                await db.query('update user set runs=runs + ? where umobile=?',[run,r[j].umobile]);
                
                //daily bonus points
                let e1,r1;
                [e1,r1] = await to(db.query('select sum(amt) as prevSell from orders where odate=? and umobile=? and is_proc=true',[dates[i],r[j].umobile]));
                let prevSell=r1[0].prevSell,currSell=r[j].tot_sell,six=0; run=0;
                if(prevSell==null) prevSell=0;
                if(prevSell<5000 && prevSell>=2000 && prevSell+currSell>=5000) { run+=4; six++; }
                else if(prevSell<2000 && prevSell+currSell>=5000) { run+=6; six++; }
                else if(prevSell<2000 && prevSell+currSell>=2000) { run+=2; }
                await db.query('update user set runs=runs + ?, sixes=sixes + ? where umobile=?',[run,six,r[j].umobile]);                    
            }
        
            
           // update product bonuses
           [e,r] = await to(db.query('select * from orders inner join product on orders.pid=product.pid where orders.odate=? and orders.is_proc=false and (product.is_hnk=true or product.is_combo=true)',[dates[i]]));
           if(e) console.log(e);
           for(var j=0;j<r.length;j++) {
                if(r[j].is_hnk==1) {
                    await db.query('update user set runs = runs + 4, fours = fours + 1 where umobile=?',[r[j].umobile]);
                }
                if(r[j].is_combo==1) {
                    await db.query('update user set runs = runs + 2 where umobile=?',[r[j].umobile]);
                }
           }

           //update weekly bonuses
           //check total price sold in week(date[i]) from newly inserted fields

           [e,r] = await to(db.query('select weekOfYear(?) as weekNo',[dates[i]]));
            let weekNo = r[0].weekNo;
            if(doneWeeks.includes(weekNo)) continue; //process one week only once
           [e,r] = await to(db.query('select umobile,sum(amt) as tot_sell from (select * from orders where weekOfYear(odate)=weekOfYear(?) and year(odate)=year(?) and is_proc=false) as ordersOnDate group by umobile',[dates[i],dates[i]]));
           if(e) console.log(e);
           for(var j=0;j<r.length;j++) {
                //check old week value
                let e1,r1;
                [e1,r1] = await to(db.query('select sum(amt) as prevSell from orders where weekOfYear(odate)=weekOfYear(?) and year(odate)=year(?) and umobile=? and is_proc=true',[dates[i],dates[i],r[j].umobile]));
                let prevSell=r1[0].prevSell, currSell=r[j].tot_sell, four=0, six=0, run=0;

                if(prevSell==null) prevSell=0; if(currSell==null) currSell=0;
                if(prevSell>=5000 && prevSell<10000 && prevSell+currSell>=10000) { four--; six++;  run+=2; }
                else if(prevSell<5000 && prevSell+currSell>=10000) { six++; run+=6; }
                else if(prevSell<5000 && prevSell+currSell>=5000) {four++; run+=4; }
                await db.query('update user set runs=runs + ?, sixes=sixes + ?, fours=fours + ? where umobile=?',[run,six,four,r[j].umobile]);  
           }

           doneWeeks.push(weekNo);
        }

        //points updated for all new orders;=
        await db.query('update orders set is_proc=true where is_proc=false');
        
        res();
    });
}

module.exports = {insertFields, updatePoints}