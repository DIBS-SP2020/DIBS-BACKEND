const mysql = require('mysql')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const express = require('express')
const router = express.Router()

let conn = mysql.createConnection({
    host: "localhost",
    user: "test",
    password: "password"
});

// LOGIN ROUTE START
router.post('/login', querySaltHandler, bcryptHandler, (req, res) => {
    let cred = req.body;
    let loginQuery = `SELECT uuid FROM dibs.user \
                      WHERE email = ${conn.escape(cred.username)} \
                      AND passhash = '${req.hash}'`;

    conn.query(loginQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute login query");
            res.status(503).json({
                error: "Database unavailable",
                loggedIn: false
            });
            return;
        }

        if(results.length == 0) {
            res.json({
                loggedIn: false
            });
            return;
        }

        let date = new Date();
        let apiKey = crypto.createHash('sha256', cred.username + date.getDate()).digest('hex');
        let uuid = conn.escape(results[0].uuid);
        let sessionInsertQuery = `INSERT INTO dibs.user_session VALUES(${conn.escape(apiKey)}, ${uuid})`;
        conn.query(sessionInsertQuery, (err, results, fields) => {
            res.json({
                loggedIn: true,
                apiKey: apiKey
            });
        });
    });
});

// Route used to logout from session
router.post('/logout', (req, res) => {
    let apiKey = req.body.apiKey;
    let deleteQuery = `DELETE FROM dibs.user_session WHERE apiKey = ${conn.escape(apiKey)}`
    conn.query(deleteQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot connect to database for logout");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }
        res.end();
    });
});

//TODO: Connect to database to verify if it is correct.
router.post('/verify', (req, res) => {
    res.json({
        verified: true
    });
})

// Handles and retrieves the salt for username.
function querySaltHandler(req, res, next) {
    let cred = req.body;
    let saltQuery = `SELECT salt FROM dibs.user WHERE email = ${conn.escape(cred.username)}`
    conn.query(saltQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute salt retrieval query");
            res.status(503).json({
                error: "Database unavailable",
                loggedIn: false
            });
            return;
        }

        // Checks if user exists in database.
        if(results.length == 0) {
            res.json({
                loggedIn: false
            });
            return;
        }
        req.salt = results[0].salt;
        next();
    });
}

function bcryptHandler(req, res, next) {
    bcrypt.hash(req.body.password, req.salt, (err, encrypted) => {
        req.hash = encrypted;
        next();
    });
}

module.exports = router;