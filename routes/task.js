const mysql = require('mysql')
const crypto = require('crypto')

const express = require('express')
const router = express.Router()

const session = require('./session')

let conn = mysql.createConnection({
    host: "localhost",
    user: "test",
    password: "password"
});

router.post('/create', session, checkAdmin, getUserList, (req, res) => {
    //Need to get list of users to randomly select one to be assigned.
    let date = new Date();
    let body = req.body;
    let groupID = conn.escape(body.groupID);
    let userList = req.userList;
    let pointValue = conn.escape(body.pointValue);
    let iconID = conn.escape(body.iconID);
    let description = conn.escape(body.description);
    let complete_date = conn.escape(body.complete_date);
    let uid = conn.escape(crypto.createHash('sha256', groupID + description + date.getDate())).digest('hex');

    let rand = Math.floor(Math.random() * userList.length);
    let userID = userList[rand].user_uuid;

    let taskQuery = `INSERT INTO dibs.tasks VALUES(${uid},${groupID},${userID},FALSE,0,\
                     ${complete_date},FALSE,${iconID},${pointValue}, ${description})`;

    conn.query(taskQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute task insertion");
            res.status(503).json({
                error: "Database unavailable",
                loggedIn: false
            });
            return;
        }

        res.json({
            taskID: uid
        });
    });

});

router.post('/delete', session, checkAdmin, (req, res) => {
    let taskID = conn.escape(req.body.taskID);

    let deleteQuery = `DELETE FROM dibs.tasks WHERE uid = ${taskID}`;

    conn.query(deleteQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute task deletion");
            res.status(503).json({
                error: "Database unavailable",
                loggedIn: false
            });
            return;
        }

        res.end();
    });
});

router.post('/update', session, checkAdmin, (req, res) => {
    let body = req.body;
    let pointValue = conn.escape(body.pointValue);
    let iconID = conn.escape(body.iconID);
    let description = conn.escape(body.description);
    let complete_date = conn.escape(body.complete_date);
    let taskID = conn.escape(body.taskID);

    let taskQuery = `UPDATE dibs.tasks VALUES(complete_date = ${complete_date}, icon_id = ${iconID},\
                        point_value = ${pointValue}, description = ${description})\
                     WHERE uid = ${taskID}`;

    conn.query(taskQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute task insertion");
            res.status(503).json({
                error: "Database unavailable",
                loggedIn: false
            });
            return;
        }

        res.end();
    });
});

router.post('/dib', session, (req, res) => {
    let body = req.body;
    let taskID = conn.escape(body.taskID);
    let userID = conn.escape(req.userID);

    let dibQuery = `UPDATE dibs.tasks VALUES(dibbed = TRUE, assigned_user = ${userID}) WHERE uid = ${taskID}`;

    conn.query(dibQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute task insertion");
            res.status(503).json({
                error: "Database unavailable",
                loggedIn: false
            });
            return;
        }

        res.end();
    });
});

router.get('/list', session, (req, res) => {
    let groupID = conn.escape(req.body.groupID);

    let listQuery = `SELECT assigned_user, dibbed, sell_value, complete_date, icon_id, point_value, description\
                     FROM dibs.tasks
                     WHERE group_uuid = ${groupID}`;

    conn.query(listQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to query database for group admin");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }
        res.json({
            list: results
        });
    });
});

router.post('/completed', session, (req, res) => {
    let body = req.body;
    let taskID = conn.escape(body.taskID);

    let dibQuery = `UPDATE dibs.tasks VALUES(completed = TRUE) WHERE uid = ${taskID}`;

    conn.query(dibQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute task insertion");
            res.status(503).json({
                error: "Database unavailable",
                loggedIn: false
            });
            return;
        }

        res.end();
    });
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

function getUserList(req, res, next) {
    let groupID = conn.escape(req.body.groupID)

    let userQuery = `SELECT user_uuid FROM dibs.in_group WHERE group.uuid = ${groupID}`;
    
    conn.query(userQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to query database for group users");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }

        req.userList = results;
        next();
    });
}

module.exports = router;