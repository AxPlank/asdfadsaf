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
app.use('/', router);
app.set('views', './views');
app.set('view engine', 'pug');
app.use('/', express.static('uploads'));
app.use('/', express.static('favicon'));

app.listen(3003, () => {
    console.log(`Connected Port 3003
    http://localhost:3003/`);
});

/**
 * 메인페이지
 */
router.get('/', (req, res) => {
    res.render('main');
});

/**
 * 이미지 저장
 * 저장 과정: 파일 전송 → 파일 저장 및 경로 재가공 → 파일 이름 변경 → 파일 이름 DB에 저장
 */
router.get('/post', (req, res) => {
    res.render('formm');
}).post('/post', (req, res) => {
    let SqlValues = [];
    upload(req, res, (err) => {
        if(err) {
            console.log(err);
            res.send(`<h1>ERROR!!!</h1><a href='/post'>Back</a>`);
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
                // 파일 확장자 분리
                const FileExtension = req.files[i].originalname.substring(req.files[i].originalname.lastIndexOf('.'), req.files[i].originalname.length);

                fs.rename(`./uploads/${req.files[i].filename}`, `./uploads/${req.files[i].filename + FileExtension}`, (err) => {
                    if (err) {
                        console.log(err);
                        res.send(`<h1>ERROR!!!</h1><a href='/post'>Back</a>`);
                    }
                });

                SqlValues.push(`('${req.files[i].filename + FileExtension}')`);
            }
            
            /**
             * 파일 url을 DB에 저장하기 위한 sql
             */
            let sql = `insert into image (image_url) values ${SqlValues.join(', ')}`;

            db.query(sql, (err, data) => {
                if (err) {
                    console.log(err);
                    res.send(`<h1>ERROR!!!</h1><a href='/post'>Back</a>`);
                } else {
                    res.redirect('/');
                }
            });
        }
    });
});

/**
 * 이미지 리스트 및 이미지 조회
 */
router.get(['/list', '/list/:id'], (req, res) => {
    const obj = {};

    /**
     * 이미지 조회 if-else 코드
     * id가 존재한다는 것은 특정 이미지를 조회하고 있다는 것으로 정해 코드를 작성했다.
     * 즉, id가 존재하면 해당 이미지만, 반대로 존재하지 않는다면 전체 리스트를 DB에서 조회했다.
     */
    if (req.params.id) {
        const sql = `select * from image where id=${req.params.id}`;

        db.query(sql, (err, data) => {
            if (err) {
                console.log(err);
                res.send(`<h1>ERROR!!!</h1><a href='/'>Back</a>`);
            } else {
                obj["image"] = data[0];
            }

            res.render('detail', obj);
        });
    } else {
        const sql = `select * from image order by id asc`;

        db.query(sql, (err, data) => {
            if (err) {
                console.log(err);
                res.send(`<h1>ERROR!!!</h1><a href='/list'>Back</a>`);
            } else {
                obj["image_list"] = data;
            }

            res.render('list', obj);
        });
    }
});