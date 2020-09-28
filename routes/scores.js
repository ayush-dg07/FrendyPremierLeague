//routes for score overall scores page
var express = require('express');
var router = express.Router();
const to = require('../utils/to');
const db = require('../config/connection');
const midware = require('../utils/loginMiddleware');
const homeController=require("../controllers/homeController");
sendScores = async (req,res) => {
    let filter=req.params.filter;
    let scoreData={};
    let e,r;
    [e,r] = await to(db.query('select uname,runs from user order by runs desc, sixes desc, fours desc limit 20'));
    scoreData.byRunsSeries=r;
    [e,r] = await to(db.query('select uname,sixes from user order by sixes desc, runs desc, fours desc limit 20'));
    scoreData.bySixesSeries=r;
    [e,r] = await to(db.query('select uname,fours from user order by fours desc, runs desc, sixes desc limit 20'));
    scoreData.byFoursSeries=r;
    scoreData.byRunsDaily=[];
    scoreData.byRunsWeekly=[];
    scoreData.byRunsMonthy=[];
    scoreData.byFoursDaily=[];
    scoreData.byFourWeekly=[];
    scoreData.byFoursMonthly=[];
    scoreData.bySixesDaily=[];
    scoreData.bySixesMonthly=[];
    scoreData.bySixesWeekly=[];

    let scoreToSend={};
    // res.send(scoreData);
    if(filter=="daily"){
        scoreToSend.byRunsSeries=scoreData.byRunsSeries;
        return res.render("home",{scores:scoreToSend});

    }
    else if(filter=="weekly"){
        scoreToSend.byRunsSeries=scoreData.byRunsWeekly;
        return res.render("home",{scores:scoreToSend});

    }
    else if(filter=="monthly"){
        scoreToSend.byRunsSeries=scoreData.byRunsMonthy;
        return res.render("home",{scores:scoreToSend});

    }
    else if(filter=="sixes"){
        scoreToSend.byRunsSeries=scoreData.bySixesSeries;
        return res.render("home",{scores:scoreToSend});

    }
    else if(filter=="fours"){
        scoreToSend.byRunsSeries=scoreData.byFoursSeries;
        return res.render("home",{scores:scoreToSend});

    }
    return res.render("home",{scores:scoreData});


  
}




router.get("/:filter",midware.redirectLogin,sendScores);
router.get('/api', midware.redirectLogin,sendScores);


router.get('/', midware.redirectLogin,sendScores);

module.exports = router;