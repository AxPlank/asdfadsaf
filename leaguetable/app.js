const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

/*
Setting
*/

app.locals.pretty = true; // 소스 코드 예쁘게 정렬

// listen
const port = 3000;
app.listen(port);

// set
app.set('views', './views'); // View에 사용할 파일들을 위치시킬 폴더 지정
app.set('view engine', 'pug'); // View에 사용할 언어 지정

// use
app.use(bodyParser.urlencoded({ // 요청이 왔을 때, JSON 파일을 읽기 위한 설정
    extended: false
}));

/*
REST API
*/

// get

app.get('/add', (req, res) => { // 리그 순위를 만드는 화면
    fs.readdir('data', (err, files) =>{ // 파일이 위치한 폴더에 접속
        if (err) { // 에러 발생 시 출력
            console.log(err);
            res.status(500).send("Internal Server Error!");
        }
        const jsons = { // View에서 사용할 데이터
            leagues: files
        };

        res.render('add', jsons);
    });
});

app.get(['/', '/:id'], (req, res) => {
    fs.readdir('data', (err, files) =>{
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error!");
        }

        let id = req.params.id; // 특정 리그 순위표를 볼 때 사용

        if (id) {
            fs.readFile('data/'+id, 'utf-8', (err, data) => {
                if (err) { // 에러 발생 시 출력
                    console.log(err);
                    res.status(500).send("Internal Server Error!");
                }

                const league_name = id.replace(/_/g, ' '); // 리그 순위표를 저장할 때, 리그 이름의 공백을 _로 대체했었음. 이를 다시 공백으로 대체하는 작업

                const jsons = { // View에서 사용할 데이터
                    leagues: files,
                    teams: data.split(','), // 보다 편리하게 사용하도록 데이터를 Array로 변환함
                    league_name: league_name
                };

                res.render('table', jsons); // table:
            });
        } else {
            const jsons = { // View에서 사용할 데이터
                leagues: files,
            };
            res.render('table', jsons);
        }
    });
});

// post
app.post('/', (req, res) => { // 리그 순위를 저장할 때 사용
    // 변수에 전송된 데이터 저장
    let title = String(req.body.league).replace(/ /g, '_');
    let body = req.body;
    let keys = Object.keys(body);

    let leagueData = String();

    // 데이터 가공. 리그 순위에 맞춰 팀들을 문자열의 형태로 저장
    for (let i = 1; i < 21; i++) {
        if (body[keys[i]] === '') { // 순위표의 순위에 해당하는 값이 ''라는 것은 모든 팀의 순위가 저장되었다는 의미함
            break;
        }

        leagueData += body[keys[i]] + ',';
    }

    leagueData = leagueData.substring(0, leagueData.length-1); // 맨 마지막 쉼표 제거

    fs.writeFile('./data/'+title, leagueData, (err) => { // 데이터 저장
        if (err) { // 에러 발생 시 에러 출력
            throw err;
        }
        
        res.redirect('/'); // 저장 후 '/'로 이동 (여기서는 메인페이지)
    });
});