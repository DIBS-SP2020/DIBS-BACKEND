const mysql = require('mysql')

const express = require('express')
const router = express.Router()

const session = require('./session')

let conn = mysql.createConnection({
    host: "localhost",
    user: "test",
    password: "password"
});

// Creates group
router.post('/create', session, (req, res) => {
    let body = req.body;
    let userID = conn.escape(req.userID);
    let date = new Date();
    let uuid = conn.escape(crypto.createHash('sha256', body.name + userID + date.getDate()).digest('hex'));

    let insertGroupQuery = `INSERT INTO dibs.groups VALUES(${uuid}, ${conn.escape(body.name)}, '0')`;
    let addGroupUserQuery = `INSERT INTO dibs.in_group VALUES(${userID}, ${uuid}, TRUE)`;

    conn.query(insertGroupQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to add group to database");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }

        conn.query(addGroupUserQuery, (err, results, fields) => {
            if(err) {
                console.log("SQL Connection Error: Unable to add user to group");
                res.status(503).json({
                    error: "Database unavailable",
                });
                return;
            }
            res.end();
        });
    });
});

// Deletes group
router.post('/delete', session, checkAdmin, (req, res) => {
    let uuid = conn.escape(req.body.groupID);

    let deleteGroupQuery = `DELETE FROM dibs.groups WHERE uuid = ${uuid}`;

    conn.query(deleteGroupQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to delete group from database");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }
        res.end();
    });
});

// TODO: update group image
router.post('/image', session, (req, res) => {
    res.status(501).end();
});

router.post('/addUser', session, inGroup, (req, res) => {

});

router.post('/modifyPermission', session, inGroup, (req, res) => {

});

router.post('/listUsers', session, inGroup, (req, res) => {

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

// Checks if person is already in group
function inGroup(req, res, next) {

}

module.exports = router;