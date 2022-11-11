const express = require('express');
const app = express();
const router = express.Router()
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
app.use('/', router);
app.set('views', './views');
app.set('view engine', 'pug');

app.listen(3003, () => {
    console.log(`Connected Port 3003
    http://localhost:3003/`);
});

router.get('/', (req, res) => {
    res.render('main');
});

router.get('/:type', (req, res) => {
    const obj = {
        type: req.params.type
    };

    res.render('formm', obj);
}).post('/:type', (req, res) => {
    console.log(req.body);
    res.send(req.body);
});