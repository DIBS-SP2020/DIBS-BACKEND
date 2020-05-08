const mysql = require('mysql')

const express = require('express')
const router = express.Router()

const session = require('./session')

let conn = mysql.createConnection({
    host: "localhost",
    user: "test",
    password: "password"
});

router.get('/', session, (req, res) => {
    let userID = conn.escape(req.userID);
    let groupID = conn.escape(req.body.groupID);

    let queryPoints = `SELECT points FROM dibs.in_group WHERE user_uuid = ${userID} AND group_uuid = ${groupID}`;

    conn.query(queryPoints, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to query database for points");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }
        if(results.length == 0) {
            res.json({
                status: "No user found"
            });
            return;
        }

        res.json({
            points: results[0].points
        })
    });
});

// People who don't want to do a task can set task sell value if they have no dibbed.
router.post('/barter/sell', session, (req, res) => {

});

// People who want to choose a task that has been dibbed, if not dibbed and a 0 point sell value, auto-dib with point credit.
router.post('/barter/buy', session, (req, res) => {

});

// Accepts barter proposal and switch task ownership
router.post('/accept', session, (req, res) => {

});

function getTask(req, res, next) {
    
}

module.exports = router;