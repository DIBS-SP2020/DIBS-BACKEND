const mysql = require('mysql')

const express = require('express')
const router = express.Router()

const session = require('./session')

let conn = mysql.createConnection({
    host: "localhost",
    user: "test",
    password: "password"
});

function findUserID(req, res, next) {
    let body = req.body;
    let apiKey = body.apiKey;

    let profileQuery = `SELECT id AS user.uuid \
                        FROM dibs.user_session \
                        JOIN dibs.user ON user.uuid = user_session.user_uuid \
                        WHERE user_session.apiKey = "${conn.escape(apiKey)}"`;

    conn.query(profileQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot connect to database for session");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }

        if(results.length > 0) {
            res.json({
                result: results
            })
        }
        next();
    });
}

router.post('/create', session, findUserID, (req, res) => {
    let body = req.body;
    res.end();
});

module.exports = router;