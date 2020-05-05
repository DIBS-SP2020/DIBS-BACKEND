const mysql = require('mysql')

let conn = mysql.createConnection({
    host: "localhost",
    user: "test",
    password: "password"
});

// Function used to check if there is a session for the user.
function sessionCheck(req, res, next) {
    let apiKey = req.body.apiKey;
    let sessionQuery = `SELECT apiKey FROM dibs.user_session WHERE apiKey = "'${conn.escape(apiKey)}'"`;
    conn.query(sessionQuery, (err, results, fields) => {
        // Check for errors connecting to database and return 503 error if fail.
        if(err) {
            console.log("SQL Connection Error: Cannot connect to database for session");
            res.status(503).json({
                error: "Database unavailable",
            });
            return;
        }

        // Checks if user exists in database.
        if(results.length == 0) {
            res.status(401).end();
            return;
        }
        next();
    });
}

module.exports = sessionCheck;