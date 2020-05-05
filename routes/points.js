const mysql = require('mysql')

const express = require('express')
const router = express.Router()

const session = require('./session')

let conn = mysql.createConnection({
    host: "localhost",
    user: "test",
    password: "password"
});

router.get('/', session, (req, res) => {

});

// People who don't want to do a task can set task sell value if they have no dibbed.
router.post('/barter/sell', session, (req, res) => {

});

// People who want to choose a task that has been dibbed, if not dibbed and a 0 point sell value, auto-dib with point credit.
router.post('/barter/buy', session, (req, res) => {

});

// Accepts barter proposal and switch task ownership
router.post('/accept', session, (req, res) => {

});

// Gets list of tasks
router.get('/barter', session, (req, res) => {

});

module.exports = router;