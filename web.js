const {port} = require('./config/config.json');


const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

app.listen(port);

app.use('/src', express.static('src'));

app.get('/timezone', async (req, res) => {
    res.sendFile(__dirname + '/views/pages/timezone.html');
})

app.get('/api/timezone/:id/:code', async (req, res) => {
    res.status(200).send({})
})