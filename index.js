const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const auth = require('./routes/auth');

// Which functions each route should use
app.use('/auth', auth);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));