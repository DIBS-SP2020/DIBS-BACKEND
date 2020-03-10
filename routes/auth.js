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
    let loginQuery = `SELECT id FROM dibs.user \
                      WHERE email = "${conn.escape(cred.username)}" \
                      AND hash = ${req.hash}`;

    conn.query(loginQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot execute salt retrieval query");
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

        res.json({
            loggedIn: true,
            apiKey: crypto.createHash('sha256', cred.username + Date.getDate())
        });
    });
});

// Handles and retrieves the salt for username.
function querySaltHandler(req, res, next) {
    let cred = req.body;
    let saltQuery = `SELECT salt FROM dibs.user WHERE email = "${conn.escape(cred.username)}"`
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

router.post('/register', (req, res) => {
    console.log(bcrypt.genSaltSync(10))
    cred = req.body;
    res.json({
        verificationKey: "<placeholder>"
    });
});

//TODO: Connect to database to verify if it is correct.
router.post('/verify', (req, res) => {
    res.json({
        verified: true
    });
})

module.exports = router