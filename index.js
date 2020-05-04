const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const auth = require('./routes/auth');
const register = require('./routes/register');
const profile = require('./routes/profile');
const task = require('./routes/task');
const group = require('./routes/group');

// Which functions each route should use
app.use('/auth', auth);
app.use('/profile', profile)
app.use('/register', register)
app.use('/task', task)
app.use('/group', group)

app.listen(port, () => console.log(`App listening on port ${port}!`));