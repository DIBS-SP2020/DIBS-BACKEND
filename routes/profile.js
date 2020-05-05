const mysql = require('mysql')

const express = require('express')
const router = express.Router()

const session = require('./session')

let conn = mysql.createConnection({
    host: "localhost",
    user: "test",
    password: "password"
});

// Default route for retrieving the profile
router.get('/', session, getUser, getGroups, getTasks, (req, res) => {
    res.json({
        tasks: req.tasks,
        user: req.user,
        group: req.groups
    })
});

// TODO: Implement image uploading
router.post('/image', session, (req, res) => {
    res.status(501).end();
});

function getUser(req, res, next) {
    let body = req.body;
    let apiKey = body.apiKey;

    let profileQuery = `SELECT images.url AS image, first AS user.first, last AS user.last, id AS user.uuid \
                        FROM dibs.user_session \
                        JOIN dibs.user ON user.uuid = user_session.user_uuid \
                        JOIN dibs.images ON user.profile_image_id = images.id \
                        WHERE user_session.apiKey = ${conn.escape(apiKey)}`;

    conn.query(profileQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute salt retrieval query");
            res.status(503).json({
                error: "Database unavailable",
                loggedIn: false
            });
            return;
        }
        
        req.user = results;
        next();
    });
}

function getGroups(req, res, next) {
    let id = req.user.id;
    let profileQuery = `SELECT groups.name AS name, groups.uuid AS group_id, images.id AS image \
                        FROM dibs.user \
                        JOIN dibs.in_group ON user.uuid = in_group.user_uuid \
                        JOIN dibs.groups ON groups.uuid = in_group.group_uuid \
                        JOIN dibs.images ON groups.profile_image_id = images.id \
                        WHERE user.uuid = ${conn.escape(id)}`;

    conn.query(profileQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute salt retrieval query");
            res.status(503).json({
                error: "Database unavailable",
                loggedIn: false
            });
            return;
        }
        
        req.groups = results;
        next();
    });
}

function getTasks(req, res, next) {
    let id = req.user.id;
    let profileQuery = `SELECT tasks.group_uuid AS group_id, dibbed AS tasks.dibbed, complete_date AS tasks.complete_date, \
                            icon_id AS tasks.icon_id, points AS tasks.point_value
                        FROM dibs.user \
                        JOIN dibs.tasks ON user.uuid = tasks.assigned_user \
                        WHERE user.uuid = ${conn.escape(id)}`;

    conn.query(profileQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute salt retrieval query");
            res.status(503).json({
                error: "Database unavailable",
                loggedIn: false
            });
            return;
        }
        
        req.tasks = results;
        next();
    });
}

module.exports = router;