const express = require('express')
const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/login', (req, res) => {
    cred = req.body;

    if(cred.username === 'admin' && cred.password === 'admin') {
        res.json({
            loggedIn: true,
            apiKey: "<placeholder>"
        });
    } else {
        res.json({
            loggedIn: false
        });
    }
    
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));