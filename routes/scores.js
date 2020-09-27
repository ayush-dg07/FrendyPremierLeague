//routes for score overall scores page
var express = require('express');
var router = express.Router();
const to = require('../utils/to');
const db = require('../config/connection');
const midware = require('../utils/loginMiddleware');

sendScores = async (req,res) => {
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

    res.send(scoreData);
}

router.get('/api', midware.redirectLogin, sendScores); //api route to fetch score leaderboard
router.get('/', midware.redirectLogin, async (req,res) => {
    res.render('scores');
})

module.exports = router;