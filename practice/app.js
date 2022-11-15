const express = require('express');
const app = express();
const router = express.Router()
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

const db = require('mysql').createConnection({
    host: 'localhost',
    user: 'root',
    password: 'joongseok03@',
    port: 3306,
    database: 'practice'
});

// const upload = multer({
//     dest: './uploads/' // dest: 저장 경로, storage를 이용할 경우 좀 더 자세하게 사용가능
// });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
})

const upload = multer({
    storage: storage
}).array('image', 10);

app.locals.pretty = true;
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('static'));
app.use('/', router);
app.set('views', './views');
app.set('view engine', 'pug');
app.use('/', express.static('uploads'));
app.use('/', express.static('favicon'));

app.listen(3003, () => {
    console.log(`Connected Port 3003
    http://localhost:3003/`);
});

router.get('/', (req, res) => {
    res.render('main');
});

router.get('/image', (req, res) => {
    res.render('formm');
}).post('/image', (req, res) => {
    setTimeout(() => {console.log("RESPONSE")}, 3 * 60 * 1000);
    let SqlValues = [];
    upload(req, res, (err) => {
        if(err) {
            console.log(err);
            res.send(`<h1>ERROR!!!</h1><a href='/'>Back</a>`);
        } else {
            /** 
             * 파일 경로와 파일 이름 재가공을 위한 반복문
             * 1. 파일 경로에 있는 \를 /로 대체하고,
             * 2. 파일 이름 뒤에 확장자를 붙여, 파일을 정상적으로 사용할 수 있게 함
             * 
             * 파일의 기존 이름을 사용하면 확장자를 붙이는 수고를 굳이 안해도 되지만,
             * 파일 이름이 중복되는 경우에 대한 설정이 귀찮았음
            */
            for (let i = 0; i < req.files.length; i++) {
                const FileExtension = req.files[i].originalname.substring(req.files[i].originalname.lastIndexOf('.'), req.files[i].originalname.length);

                fs.rename(`./uploads/${req.files[i].filename}`, `./uploads/${req.files[i].filename + FileExtension}`, (err) => {
                    if (err) {
                        console.log(err);
                        res.send(`<h1>ERROR!!!</h1><a href='/'>Back</a>`);
                    }
                });

                SqlValues.push(`('${req.files[i].filename + FileExtension}')`);
            }
            console.log(1);
            

            let sql = `insert into image (image_url) values ${SqlValues.join(', ')}`;
            console.log(sql);

            db.query(sql, (err, data) => {
                if (err) {
                    console.log(err);
                    res.send(`<h1>ERROR!!!</h1><a href='/'>Back</a>`);
                } else {
                    res.send('success');
                }
            });
        }
    });
});