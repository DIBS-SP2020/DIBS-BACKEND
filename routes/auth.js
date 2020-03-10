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

router.post('/login', (req, res) => {
    let cred = req.body;
    
    let saltQuery = `SELECT salt FROM dibs.user WHERE email = "${conn.escape(cred.username)}"`

    conn.query(saltQuery, (err, results, fields) => {
        if(err) {
            console.log("SQL Connection Error: Cannot execute salt retrieval query");
        }
        console.log(results)
        // conn.query
        // if(cred.username === 'admin' && cred.password === 'admin') {
        //     res.json({
        //         loggedIn: true,
        //         apiKey: "<placeholder>"
        //     });
        // } else {
        //     res.json({
        //         loggedIn: false
        //     });
        // }
    });
});

router.post('/register', (req, res) => {
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