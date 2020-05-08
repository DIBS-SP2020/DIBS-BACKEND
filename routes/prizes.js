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

// Gets list of prizes
router.get('/', session, (req, res) => {
    let body = req.body;
    let groupID = conn.escape(body.groupID);

    let prizeQuery = `SELECT name, points FROM dibs.prizes WHERE group_uuid = ${groupID}`;

    conn.query(prizeQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute salt retrieval query");
            res.status(503).json({
                error: "Database unavailable",
                loggedIn: false
            });
            return;
        }
        res.json({
            list: results
        })
    });
});

// Creates prizes
router.post('/create', session, checkAdmin, (req, res) => {
    let date = new Date();
    let body = req.body;
    let groupID = conn.escape(body.groupID);
    let name = conn.escape(body.name);
    let points = conn.escape(body.points);
    let id = conn.escape(crypto.hash('sha256', groupID + name + date.getDate()).digest('hex'));

    let insertPrizeQuery = `INSERT INTO dibs.prizes VALUES(${id},${groupID},${name},${points})`;

    conn.query(insertPrizeQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to insert prize into database");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }

        res.json({
            prizeID: id
        });
    });
});

// Deletes prizes
router.post('/delete', session, checkAdmin, (req, res) => {
    let body = req.body;
    let id = body.prizeID;

    let deletePrizeQuery = `DELETE FROM dibs.prizes WHERE id = ${id}`

    conn.query(deletePrizeQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to insert prize into database");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }

        res.end();
    });
});

// Buys using points
router.post('/buy', session, getPoints, getPrizeValue, (req, res) => {
    let points = req.points;
    let prizePoints = req.prizePoints;
    let userID = conn.escape(req.userID);
    let uuid = conn.escape(req.body.groupID);

    let newPoints = points - prizePoints;

    if(newPoints < 0) {
        res.json({
            status: "Not enough points"
        })
    }

    let buyQuery = `UPDATE dibs.in_group SET points = ${newPoints} WHERE user_uuid = ${userID} AND group_uuid = ${uuid}`;

    conn.query(buyQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to update point values of user");
            res.status(503).json({
                error: "Database unavailable",
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

function getPoints(req, res, next) {
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

        req.points = results[0].points;

        next();
    });
}

function getPrizeValue(req, res, next) {
    let prizeID = conn.escape(req.body.prizeID);

    let prizeValueQuery = `SELECT points FROM dibs.prizes WHERE id = ${prizeID}`;

    conn.query(prizeValueQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Unable to query database for prize points");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }
        if(results.length == 0) {
            res.json({
                status: "No prize found"
            });
            return;
        }

        req.prizePoints = results[0].points;

        next();
    });
}

module.exports = router;