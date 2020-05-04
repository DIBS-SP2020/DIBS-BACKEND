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

function checkUsername(req, res, next) {
    let username = req.body.username
    let usernameQuery = `SELECT username FROM dibs.user\
                         WHERE LOWER(username) = LOWER("${conn.escape(username)}")`;
    conn.query(usernameQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute username query");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }

        if(results.length > 0) {
            res.json({
                accountCreated: false,
                reason: "Email already in use"
            });
            return;
        }
        next();
    });
}

function bcryptSaltGen(req, res, next) {
    bcrypt.genSalt(20, (err, salt) => {
        req.salt = salt;
        next();
    })
}

function bcryptHandler(req, res, next) {
    bcrypt.hash(req.body.password, req.salt, (err, encrypted) => {
        req.hash = encrypted;
        next();
    });
}

// Route used to register for an account
router.post('/register', checkUsername, bcryptSaltGen, bcryptHandler, (req, res) => {
    let username = conn.escape(req.body.username);
    let uuid = conn.escape(crypto.createHash('sha256', username + Date.getDate()));
    let first = conn.escape(req.body.first);
    let last = conn.escape(req.body.last);
    let hash = conn.escape(req.hash);
    let salt = conn.escape(req.salt);

    let insertQuery = `INSERT INTO dibs.user VALUES("${uuid}", "${first}", "${last}", "${username}", "${salt}", "${hash}", "0")`;

    conn.query(insertQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute username query");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }
        res.json({
            accountCreated: true
        });
    });
});

module.exports = router;