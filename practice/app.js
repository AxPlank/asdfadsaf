const express = require('express');
const app = express();
const router = express.Router()
const bodyParser = require('body-parser');
const multer = require('multer');

const db = require('mysql').createConnection({
    host: 'localhost',
    user: 'root',
    password: 'joongseok03@',
    port: 3306,
    database: 'thirdproject'
});

// const upload = multer({
//     dest: './uploads/'
// });

const upload = multer({ // dest: 저장 경로, storage를 이용할 경우 좀 더 자세하게 사용가능
    dest: './uploads/'
}).array('image', 10);

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

router.get('/image', (req, res) => {
    const obj = {
        type: req.params.type
    };

    res.render('formm', obj);
}).post('/image', (req, res) => {
    upload(req, res, (err) => {
        if(err) {
            res.send(`<a href='/'>Back</a>`);
        } else {
            res.send(req.files);
        }
    });
});