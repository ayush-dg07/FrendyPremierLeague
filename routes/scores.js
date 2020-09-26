//routes for score overall scores page
var express = require('express');
var router = express.Router();
const to = require('../utils/to');
const db = require('../config/connection');

sendScores = async (req,res) => {
    let scoreData={};
    let e,r;
    [e,r] = await to(db.query('select uname,runs from user order by runs desc, sixes desc, fours desc limit 20'));
    scoreData.byRuns=r;
    [e,r] = await to(db.query('select uname,sixes from user order by sixes desc, runs desc, fours desc limit 20'));
    scoreData.bySixes=r;
    [e,r] = await to(db.query('select uname,fours from user order by fours desc, runs desc, sixes desc limit 20'));
    scoreData.byFours=r;
    res.send(scoreData);
}

router.get('/scores/api',sendScores);
router.get('/', async (req,res) => {
    res.send('<h1>This is the homepage</h1>')
})

module.exports = router;