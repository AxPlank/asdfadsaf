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

/**
 * Middleware
 */
app.use(bodyParser.urlencoded({ // 요청이 왔을 때, JSON 파일을 읽기 위한 설정
    extended: false
}));
app.use(express.static('static'));

// Mainpage
app.get('/', (req, res) => {
    let sql = 'select id, league from leagues';

    db.query(sql, (err, rows, fields) => {
        if (err) {
            const jsonn = {
                leagues: rows,
                errortype: 500
            }

            console.log(err);
            res.render('error', jsonn);
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
app.get('/:league', (req, res) => {
    let sql = 'select league from leagues';

    db.query(sql, (err, rows, fields) => {
        if (err) {
            const jsonn = {
                leagues: rows,
                errortype: 500
            };

            console.log(err);
            res.render('error', jsonn);
        } else {
            const leagues = rows;
            const league = req.params.league.replace(/[(]/g,'').replace(/[)]/g,'');
            sql = `select * from ${league} order by ranking, team`;

            db.query(sql, (err, rows, fields) => {
                if (err) {
                    const jsonn = {
                        leagues: leagues,
                        errortype: 500
                        };
                        
                    console.log(err);
                    res.render('error', jsonn);
                } else {
                    const teams = rows;

                    const jsonn = {
                        leagues: leagues,
                        league: req.params.league,
                        teams: teams
                    };
                    
                    res.render('table', jsonn);
                }
            });
        }
    });
});

/**
 * 리그 순위표 수정 및 팀 데이터 삭제
 */
// 팀 데이터 수정 페이지 접속
app.get('/:league/:team/edit', (req, res) => {
    let sql = 'select league from leagues';

    db.query(sql, (err, rows, fields) => {
        if (err) {
            const jsonn = {
                leagues: rows,
                league: req.params.league,
                errortype: 500,
            };

            console.log(err);
            res.render('error', jsonn);
        } else {
            const leagues = rows;
            const league = req.params.league.replace(/[(]/g,'').replace(/[)]/g,'');
            const team = req.params.team.replace(/_/g, ' ');
            sql = `select * from ${league} where team='${team}'`;

            db.query(sql, (err, rows, fields) => {
                if (err) {
                    const jsonn = {
                        leagues: leagues,
                        league: req.params.league,
                        errortype: 500,
                    };
    
                    console.log(err);
                    res.render('error', jsonn);
                } else {
                    const jsonn = {
                        leagues: leagues,
                        league: req.params.league,
                        teamdata: rows[0],
                    };

                    res.render('edit', jsonn);
                }
            });
        }
    });
});

// 팀 데이터 수정
app.post('/:league/:team/edit', (req, res) => {
    let sql = 'select league from leagues';

    db.query(sql, (err, rows, fields) => {
        if (err) {
            const jsonn = {
                leagues: rows,
                league: req.params.league,
                team: req.params.team,
                errortype: 500,
            };

            console.log(err);
            res.render('error', jsonn);
        } else {
            const leagues = rows;
            const league = req.params.league.replace(/[(]/g,'').replace(/[)]/g,'');
            const team = req.params.team.replace(/_/g, ' ');

            if (Object.values(req.body).includes("")) {
                const jsonn = {
                    leagues: leagues,
                    league: req.params.league,
                    team: req.params.team,
                    page: 'edit',
                    errortype: 400,
                };

                res.render('error', jsonn);
            }

            const values = Object.values(req.body).map(Number);

            sql = `update ${league} set ranking=?, pl=?, win=?, draw=?, lose=?, f=?, a=?, gd=?, pts=? where team='${team}'`;
            db.query(sql, values, (err, rows, fields) => {
                if (err) {
                    const jsonn = {
                        leagues: leagues,
                        league: req.params.league,
                        team: req.params.team,
                        errortype: 500,
                    };
        
                    console.log(err);
                    res.render('error', jsonn);
                } else {
                    res.redirect(`/${req.params.league}`);
                }
            });
        }
    });
});

// 팀 데이터 삭제
app.get('/:league/:team/delete', (req, res) => {
    let sql = 'select league from leagues';

    db.query(sql, (err, rows, fields) => {
        if (err) {
            const jsonn = {
                leagues: rows,
                league: req.params.league,
                team: req.params.team,
                errortype: 500,
            };

            console.log(err);
            res.render('error', jsonn);
        } else {
            const leagues = rows;
            const league = req.params.league.replace(/[(]/g,'').replace(/[)]/g,'');
            const team = req.params.team.replace(/_/g, ' ');
            sql = `delete from ${league} where team='${team}'`;
            
            db.query(sql, (err) => {
                if (err) {
                    const jsonn = {
                        leagues: leagues,
                        league: req.params.league,
                        team: req.params.team,
                        errortype: 500,
                    };
        
                    console.log(err);
                    res.render('error', jsonn);
                } else {
                    res.redirect(`/${req.params.league}`);
                }
            });
        }
    });
});

/**
 * 리그 소속팀 추가
 */
// 팀 추가 페이지 접속
app.get('/:league/add', (req, res) => {
    let sql = 'select * from leagues';

    db.query(sql, (err, rows, fields) => {
        if (err) {
            const jsonn = {
                leagues: rows,
                league: req.params.league,
                errortype: 500,
            };

            console.log(err);
            res.render('error', jsonn);
        } else {
            const leagues = rows;
            const league = req.params.league;

            const jsonn = {
                leagues: leagues,
                league: league
            };

            res.render('add', jsonn);
        }
    }); 
});

// 팀 추가
app.post('/:league/add', (req, res) => {
    let sql = 'select * from leagues';

    db.query(sql, (err, rows, fields) => {
        if (err) {
            const jsonn = {
                leagues: rows,
                league: req.params.league,
                page: 'add',
                errortype: 500,
            };

            console.log(err);
            res.render('error', jsonn);
        } else {
            const leagues = rows;
            const league = req.params.league.replace(/[(]/g,'').replace(/[)]/g,'');

            if (Object.values(req.body).includes("")) {
                const jsonn = {
                    leagues: leagues,
                    league: req.params.league,
                    page: 'add',
                    errortype: 400
                };

                res.render('error', jsonn);
            }

            const values = Object.values(req.body).map((e, i) => {
                if (i !== 1) {
                    return parseInt(e);
                } else {
                    return e;
                }
            });

            sql = `insert into ${league} (ranking, team, pl, win, draw, lose, f, a, gd, pts) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.query(sql, values, (err, rows, fields) => {
                if (err) {
                    const jsonn = {
                        leagues: leagues,
                        league: req.params.league,
                        page: 'add',
                        errortype: 500,
                    };
        
                    console.log(err);
                    res.render('error', jsonn);
                } else {
                    res.redirect(`/${req.params.league}`);
                }
            });
        }
    }); 
});