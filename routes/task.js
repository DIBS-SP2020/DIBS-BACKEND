const mysql = require('mysql')

const express = require('express')
const router = express.Router()

const session = require('./session')

let conn = mysql.createConnection({
    host: "localhost",
    user: "test",
    password: "password"
});

router.post('/create', session, checkAdmin, (req, res) => {
    //Need to get list of users to randomly select one to be assigned.
});

router.post('/delete', session, checkAdmin, (req, res) => {

});

router.post('/update', session, checkAdmin, (req, res) => {

});

router.post('/dib', session, (req, res) => {

});

router.get('/list', session, (req, res) => {

});

router.post('/completed', session, (req, res) => {

});

function checkAdmin(req, res, next) {
    let userID = conn.escape(req.userID);
    let uuid = conn.escape(req.body.groupID);

    let adminQuery = `SELECT admin FROM dibs.in_group WHERE user_uuid = ${userID} AND group_uuid = ${uuid}`;

    conn.query(adminQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to query database for group admin");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }

        if(!results[0].admin) {
            res.status(401).end();
        }

        next();
    });
}

module.exports = router;