const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const mysql = require('mysql');

app.locals.pretty = true; // 소스 코드 예쁘게 정렬

// listen
app.listen(3000);

// Database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'joongseok03@',
    port: 3306,
    database: 'football'    
});

// set
app.set('views', './views'); // View에 사용할 파일들을 위치시킬 폴더 지정
app.set('view engine', 'pug'); // View에 사용할 언어 지정

// Middleware
app.use(bodyParser.urlencoded({ // 요청이 왔을 때, JSON 파일을 읽기 위한 설정
    extended: false
}));

// Mainpage
app.get('/', (req, res) => {
    let sql = 'select id, league from leagues';

    db.query(sql, (err, rows, fields) => {
        if (err) {
            console.log(err);
                res.status(404).send("Not Found Page!!!");
        } else {
            const jsonn = {
                leagues: rows
            };

            res.render('table', jsonn);
        }
    });
});

/**
 * 기능
*/

/**
 * 리그 순위표 조회
 */
// 순위표 조회 페이지 접속
app.get('/:id', (req, res) => {
    let sql = 'select league from leagues';

    db.query(sql, (err, rows, fields) => {
        if (err) {
            console.log(err);
                res.status(404).send("Not Found Page!!!");
        }

        const leagues = rows;
        const id = req.params.id.replace(/[(]/,'').replace(/[)]/,'');
        sql = `select * from ${id} order by ranking, team`;

        db.query(sql, (err, rows, fields) => {
            if (err) {
                console.log(err);
                res.status(404).send("Not Found Page!!!");
            } else {
                const teams = rows;

                const jsonn = {
                    leagues: leagues,
                    league: req.params.id,
                    teams: teams
                }

                res.render('table', jsonn);
            }
        });
    });
});

/**
 * 리그 순위표 수정
 */
// 팀 데이터 수정 페이지 접속
app.get('/:league/:team/edit', (req, res) => {
    let sql = 'select league from leagues';

    db.query(sql, (err, rows, fields) => {
        if (err) {
            console.log(err);
                res.status(404).send("Not Found Page!!!");
        }

        const leagues = rows;
        const league = req.params.league.replace(/[(]/,'').replace(/[)]/,'');
        const team = req.params.team.replace(/_/g, ' ');
        sql = `select * from ${league} where team='${team}'`;

        db.query(sql, (err, rows, fields) => {
            if (err) {
                console.log(err);
                res.status(404).send("Not Found Page!!!");
            } else {
                const jsonn = {
                    leagues: leagues,
                    league: req.params.league,
                    teamdata: rows[0],
                }

                res.render('edit', jsonn);
            }
        });
    });
});

// 팀 데이터 수정
app.post('/:league/:team/edit', (req, res) => {
    let sql = 'select league from leagues';

    db.query(sql, (err, rows, fields) => {
        if (err) {
            console.log(err);
                res.status(404).send("Not Found Page!!!");
        }

        const leagues = rows;
        const league = req.params.league.replace(/[(]/,'').replace(/[)]/,'');
        const team = req.params.team.replace(/_/g, ' ');
        const output = `<h4>league: ${league}</h4><h4>team: ${team}</h4>`;

        res.send(output);
        // sql = `select * from ${league} where team='${team}'`;

        // db.query(sql, (err, rows, fields) => {
        //     if (err) {
        //         console.log(err);
        //         res.status(404).send("Not Found Page!!!");
        //     } else {
        //         const jsonn = {
        //             leagues: leagues,
        //             league: req.params.league,
        //             teamdata: rows[0],
        //         }

        //         res.render('edit', jsonn);
        //     }
        // });
    });
});