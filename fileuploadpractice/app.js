const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const db = require('mysql').createConnection({
    host: 'localhost',
    user: 'root',
    password: 'joongseok03@',
    port: 3306,
    database: 'thirdproject'
});

app.locals.pretty = true;
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('static'));

app.listen(3003, () => {
    console.log(`Connected Port 3003
    http://localhost:3003/`);
});

app.get('/', (req, res) => {
    res.send("HELLO");
});