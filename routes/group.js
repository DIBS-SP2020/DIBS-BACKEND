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
            res.json({
                groupID: uuid
            });
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

    if(results.length > 0) {
        res.json({
            status: "User already exists"
        });
    }

    let userID = conn.escape(req.userID);
    let uuid = conn.escape(req.body.groupID);

    let addUserQuery = `INSERT INTO dibs.in_group VALUES(${userID}, ${uuid}, FALSE, 0, FALSE)`;

    conn.query(addUserQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to query database for group admin");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }
        res.end();
    });
});

router.post('/modifyPermission', session, checkAdmin, inGroup, (req, res) => {

    if(req.num_users == 0) {
        res.json({
            status: "User not in group"
        });
    }

    let userID = conn.escape(req.body.modifiedUserID);
    let groupID = conn.escape(req.body.groupID);

    let modifyQuery = `UPDATE dibs.in_group SET admin = TRUE WHERE user_uuid = ${userID} AND group_uuid = ${groupID}`;

    conn.query(modifyQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to query database for group admin");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }
        res.end();
    });
});

router.post('/verify', session, checkAdmin, inGroup, (req, res) => {

    if(req.num_users == 0) {
        res.json({
            status: "User not in group"
        });
    }

    let userID = conn.escape(req.body.modifiedUserID);
    let groupID = conn.escape(req.body.groupID);

    let modifyQuery = `UPDATE dibs.in_group SET verified = TRUE WHERE user_uuid = ${userID} AND group_uuid = ${groupID}`;

    conn.query(modifyQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to query database for group admin");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }
        res.end();
    });
});

router.get('/listUsers', session, inGroup, (req, res) => {
    if(results.length == 0) {
        res.json({
            status: "Not part of group"
        });
    }

    let groupID = conn.escape(req.body.groupID)

    let userQuery = `SELECT user.first AS first, user.last AS last, images.url AS image\
                     FROM dibs.in_group
                     JOIN dibs.in_group ON user.uuid = in_group.user_uuid \
                     JOIN dibs.groups ON groups.uuid = in_group.group_uuid \
                     JOIN dibs.images ON groups.profile_image_id = images.id \
                     WHERE group.uuid = ${groupID}`;
    
    conn.query(userQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to query database for group users");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }

        res.json({
            users: results
        });
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

// Checks if person is already in group
function inGroup(req, res, next) {
    let userID = conn.escape(req.userID);
    let uuid = conn.escape(req.body.groupID);

    let adminQuery = `SELECT user_uuid FROM dibs.in_group WHERE user_uuid = ${userID} AND group_uuid = ${uuid}`;

    conn.query(adminQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to query database for user in group");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }
        req.num_users = results.length;
        next();
    });
}

module.exports = router;