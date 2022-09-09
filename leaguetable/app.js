const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

/*
Setting
*/

app.locals.pretty = true;

// listen
const port = 3000;
app.listen(port, () => {
    console.log('Connected!');
});

// set
app.set('views', './views');
app.set('view engine', 'pug');

// use
app.use(bodyParser.urlencoded({
    extended: false
}));

/*
REST API
*/

// get

app.get('/add', (req, res) => {
    fs.readdir('data', (err, files) =>{
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error!");
        }

        let id = req.params.id;

        if (id) {
            fs.readFile('data/'+id, 'utf-8', (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error!");
                }

                const league_name = id.replace(/_/g, ' ');

                const jsons = {
                    leagues: files,
                    teams: data.split(','),
                    league_name: league_name
                };

                res.render('table', jsons);
            });
        } else {
            const jsons = {
                leagues: files,
            };
            res.render('add', jsons);
        }
    });
});

app.get(['/', '/:id'], (req, res) => {
    fs.readdir('data', (err, files) =>{
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error!");
        }

        let id = req.params.id;

        if (id) {
            fs.readFile('data/'+id, 'utf-8', (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error!");
                }

                const league_name = id.replace(/_/g, ' ');

                const jsons = {
                    leagues: files,
                    teams: data.split(','),
                    league_name: league_name
                };

                res.render('table', jsons);
            });
        } else {
            const jsons = {
                leagues: files,
            };
            res.render('table', jsons);
        }
    });
});

// post
app.post('/', (req, res) => {
    // 변수에 전송된 데이터 저장
    let title = String(req.body.league).replace(/ /g, '_');
    let body = req.body;
    let keys = Object.keys(body);

    let data = Array();

    // 데이터 가공
    for (let i = 1; i < 21; i++) { // value가 ''라는 것은 해당 리그의 리그 순위표가 모두 나왔다는 것과 동일한 의미를 가지므로 반복문 중단 선언
        if (body[keys[i]] === '') {
            break;
        }

        data.push(body[keys[i]]);
    }

    data = data.join(',');

    fs.writeFile('./data/'+title, data, (err) => {
        if (err) {
            throw err;
        }
        
        res.redirect('/');
    });
});