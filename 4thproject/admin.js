"use strict"

const express = require('express');
const mysql = require('mysql');
const sha256 = require('sha256');

const router = express.Router();
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'joongseok03@',
    port: 3306,
    database: 'thirdproject'
});

function getCondition (table, form) {
    const searchtype = {
        board : {
            all: ["title", "content", "auth"],
            title: ["title"],
            content: ["content"],
            auth: ["auth"]
        },
        category : {
            category: ["category"]
        },
        personal_info : {
            all: ["user_id", "nickname"],
            user_id: ["user_id"],
            nickname: ["nickname"]
        },
        team : {
            all: ["league", "team"],
            league: ["league"],
            team: ["team"]
        },
    }

    const condition = searchtype[table][form.searchType].map((el) => {
        el = el + ' like ' + `"%${form.search}%"`
        return el;
    }).join(' or ');

    return condition;
}

const getPK = (table) => {
    const PK = {
        board: 'board_id',
        category: 'category_id',
        personal_info: 'personal_id',
        team: 'team_id'
    }

    return PK[table];
}

const PostValid = (obj) => {
    const title = obj.title;

    const ByteLength = ((s, b, i, c) => {
        for(b = i = 0; c = s.charCodeAt(i++); b += c >> 11? 3 : c >> 7 ? 2 : 1);
        
        return b;
    })(title);

    if (ByteLength > 200) {
        return true;
    } else {
        return false;
    }
}

const teamValid = (values) => {
    for (let i = 0; i < values.length; i++) {
        if (!values[i]) {
            return false;
        }
    }

    return true;
}

// Admin
router.get('/login', (req, res) => {
    if (!req.session.user) {
        const obj = {
            error: null
        }
        res.render('login', obj);
    } else if (req.session.user.auth !== 'admin') {
        res.send("You are not Admin!");
    } else {
        res.redirect('/admin/main');
    }
}).post('/login', (req, res) => {
    if (!req.session.user) {
        if (Object.values(req.body).includes("")) {
            const obj = {
                error: "입력하지 않은 값이 존재합니다."
            }

            res.render('login', obj);
        } else {
            let sql = `select user_id, pw, secret_key, nickname, authority from personal_info where user_id='${req.body.adminID}'`;
            const loginForm = req.body;

            db.query(sql, (err, rows) => {
                if (err) {
                    res.send(err);
                } else if (rows.length === 0) {
                    const obj = {
                        error: "존재하지 않는 ID입니다."
                    }

                    res.render('login', obj);
                } else {
                    const data = rows[0];
                    const hashPW = sha256(loginForm.adminPassword + data.secret_key);

                    if (hashPW === data.pw) {
                        req.session.user = {
                            user_id: data.user_id,
                            name: data.nickname,
                            auth: data.authority
                        }

                        res.redirect('/admin/main');
                    } else {
                        const obj = {
                            error: "잘못된 비밀번호입니다."
                        }
    
                        res.render('login', obj);
                    }
                }
            });
        }
    } else if (req.session.user.auth !== 'admin') {
        res.send("You are not Admin!");
    } else {
        res.redirect('/admin/main');
    }
});

router.get('/:kwarg', (req, res) => {
    if (!req.session.user) {
        res.redirect('/admin/login');
    } else if (req.session.user.auth !== 'admin') {
        res.send("You are not Admin!");
    } else {
        const kwarg = req.params.kwarg;
        let sql = "select table_name from information_schema.tables where table_schema='thirdproject'";
        
        db.query(sql, (err, results) => {
            if (err) {
                res.send(err);
            } else {
                const tables = results.filter(el => el.TABLE_NAME.match(/_media/) === null);

                if (kwarg === 'main') {
                    const obj = {
                        user: req.session.user.name,
                        auth: req.session.user.auth,
                        tables: tables,
                        instances: null
                    }

                    res.render('admin', obj);
                } else {
                    sql = `select * from ${kwarg}`;

                    db.query(sql, (err, results) => {
                        if (err) {
                            res.send(err);
                        } else {
                            const obj = {
                                user: req.session.user.name,
                                auth: req.session.user.auth,
                                tables: tables,
                                table: kwarg,
                                instances: results.reverse()
                            }

                            res.render('admin', obj);
                        }
                    });
                }
            }
        });
    }
}).post('/:kwarg', (req, res) => {
    if (!req.session.user) {
        res.redirect('/admin/login');
    } else if (req.session.user.auth !== 'admin') {
        res.send("You are not Admin!");
    } else {
        const kwarg = req.params.kwarg;
        let sql = "select table_name from information_schema.tables where table_schema='thirdproject'";
        
        db.query(sql, (err, results) => {
            if (err) {
                res.send(err);
            } else {
                const tables = results.filter(el => el.TABLE_NAME.match(/_media/) === null);

                if (parseInt(kwarg)) {
                    res.send("kwarg is number");
                } else if (kwarg === 'main') {
                    const obj = {
                        user: req.session.user.name,
                        auth: req.session.user.auth,
                        tables: tables,
                        instances: null
                    }

                    res.render('admin', obj);
                } else {
                    const searchCondition = getCondition(kwarg, req.body);

                    let sql = `select * from ${kwarg} where ${searchCondition}`;

                    db.query(sql, (err, results) => {
                        if (err) {
                            res.send(err);
                        } else {
                            const obj = {
                                user: req.session.user.name,
                                auth: req.session.user.auth,
                                tables: tables,
                                table: kwarg,
                                instances: results.reverse()
                            }

                            res.render('admin', obj);
                        }
                    });
                }
            }
        });
    }
});

router.post('/:kwarg/delete', (req, res) => {
    if (!req.session.user) {
        res.redirect('/admin/login');
    } else if (req.session.user.auth !== 'admin') {
        res.send("You are not Admin!");
    } else {
        const kwarg = req.params.kwarg;

        if (req.body.allcheck) {
            let sql = `delete from ${kwarg}`;

            db.query(sql, (err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect(`/admin/${kwarg}`);
                }
            });
        } else {
            const PK = getPK(kwarg);
            const PKs = Array.isArray(req.body.instance) ? req.body.instance.join(', ') : parseInt(req.body.instance);
            
            let sql = `delete from ${kwarg} where ${PK} in (${PKs})`;

            db.query(sql, (err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect(`/admin/${kwarg}`);
                }
            });
        }
    }
});

router.get('/:kwarg/add', (req, res) => {
    if (!req.session.user) {
        res.redirect('/admin/login');
    } else if (req.session.user.auth !== 'admin') {
        res.send("You are not Admin!");
    } else {
        const kwarg = req.params.kwarg;
        
        let sql = "select table_name from information_schema.tables where table_schema='thirdproject'";
        
        db.query(sql, (err, results) => {
            if (err) {
                res.send(err);
            } else {
                const tables = results.filter(el => el.TABLE_NAME.match(/_media/) === null);

                if (kwarg === "board" || kwarg === "team") {
                    sql = 'select category from category order by category';

                    db.query(sql, (err, results) => {
                        if (err) {
                            res.send(err);
                        } else {
                            const obj = {
                                user: req.session.user.name,
                                auth: req.session.user.auth,
                                tables: tables,
                                table: kwarg,
                                leagues: results,
                                form: null,
                                error: null
                            }
            
                            res.render('admin_add', obj);
                        }
                    });
                } else if (kwarg === "category") {
                    const obj = {
                        user: req.session.user.name,
                        auth: req.session.user.auth,
                        tables: tables,
                        table: kwarg,
                        form: null,
                        error: null
                    }
    
                    res.render('admin_add', obj);
                } else {
                    res.status(404).send(404);
                }
            }
        });
    }
}).post('/:kwarg/add', (req, res) => {
    if (!req.session.user) {
        res.redirect('/admin/login');
    } else if (req.session.user.auth !== 'admin') {
        res.send("You are not Admin!");
    } else {
        const kwarg = req.params.kwarg;
        
        let sql = "select table_name from information_schema.tables where table_schema='thirdproject'";
        
        db.query(sql, (err, results) => {
            if (err) {
                res.send(err);
            } else {
                const tables = results.filter(el => el.TABLE_NAME.match(/_media/) === null);

                if (kwarg === "board") {
                    sql = 'select category from category order by category';

                    db.query(sql, (err, results) => {
                        if (err) {
                            res.send(err);
                        } else {
                            if (Object.values(req.body).includes("")) {
                                const obj = {
                                    user: req.session.user.name,
                                    auth: req.session.user.auth,
                                    tables: tables,
                                    table: kwarg,
                                    leagues: results,
                                    form: req.body,
                                    error: "입력되지 않은 항목이 존재합니다."
                                }
                
                                res.render('admin_add', obj);
                            } else if (PostValid(req.body)) {
                                const obj = {
                                    user: req.session.user.name,
                                    auth: req.session.user.auth,
                                    tables: tables,
                                    table: kwarg,
                                    leagues: results,
                                    form: req.body,
                                    error: "제목이 너무 깁니다."
                                }
                
                                res.render('admin_add', obj);
                            } else {
                                const subQuery1 = `(select personal_id from personal_info where nickname="${req.session.user.name}")`;
                                const subQuery2 = `(select category_id from category where category="${req.body.category}")`;

                                let sql = `insert into board (auth_id, auth, title, category, content, create_date, notice) values (${subQuery1}, "${req.session.user.name}", "${req.body.title}", ${subQuery2}, "${req.body.content}", now(), 1)`;
                                
                                db.query(sql, (err) => {
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        res.redirect('/admin/board');
                                    }
                                });
                            }
                        }
                    });
                } else if (kwarg === "category") {
                    if (Object.values(req.body).includes("")) {
                        const obj = {
                            user: req.session.user.name,
                            auth: req.session.user.auth,
                            tables: tables,
                            table: kwarg,
                            form: req.body,
                            error: "입력되지 않은 항목이 존재합니다."
                        }
        
                        res.render('admin_add', obj);
                    } else {
                        let sql = `insert into category (category) values ("${req.body.category}")`;
                        
                        db.query(sql, (err) => {
                            if (err) {
                                res.send(err);
                            } else {
                                res.redirect('/admin/category');
                            }
                        });
                    }
                } else if (kwarg === "team") {
                    sql = 'select category from category order by category';

                    db.query(sql, (err, results) => {
                        if (err) {
                            res.send(err);
                        } else {
                            if (Object.values(req.body).includes("")) {
                                const obj = {
                                    user: req.session.user.name,
                                    auth: req.session.user.auth,
                                    tables: tables,
                                    table: kwarg,
                                    leagues: results,
                                    form: req.body,
                                    error: "입력되지 않은 항목이 존재합니다."
                                }
                
                                res.render('admin_add', obj);
                            } else {
                                const teamValues = Object.values(req.body).map((el, idx) => {
                                    if (idx === 0 || idx === 1) {
                                        return el;
                                    } else {
                                        return parseInt(el);
                                    }
                                });
        
                                if (teamValid(teamValues)) {
                                    const pl = teamValues[2] + teamValues[3] + teamValues[4];
                                    const gd = teamValues[5] - teamValues[6];
                                    const pts = teamValues[2] * 3 + teamValues[3];

                                    sql = `insert into team (team, league, pl, win, draw, lose, gf, ga, gd, pts) values ("${teamValues[0]}", "${teamValues[1]}", ${pl}, ${teamValues[2]}, ${teamValues[3]}, ${teamValues[4]}, ${teamValues[5]}, ${teamValues[6]}, ${gd}, ${pts})`;

                                    db.query(sql, (err) => {
                                        if (err) {
                                            res.send(err);
                                        } else {
                                            res.redirect('/admin/team');
                                        }
                                    });
                                } else {
                                    const obj = {
                                        user: req.session.user.name,
                                        auth: req.session.user.auth,
                                        tables: tables,
                                        table: kwarg,
                                        leagues: results,
                                        form: req.body,
                                        error: "값이 유효하지 않은 항목이 존재합니다."
                                    }
                    
                                    res.render('admin_add', obj);
                                }
                            }
                        }
                    });
                } else {
                    res.status(404).send(404);
                }
            }
        });
    }
});

router.get('/:kwarg/:id', (req, res) => {
    if (!req.session.user) {
        res.redirect('/admin/login');
    } else if (req.session.user.auth !== 'admin') {
        res.send("You are not Admin!");
    } else {
        const kwarg = req.params.kwarg;
        const id = req.params.id;
        let sql = "select table_name from information_schema.tables where table_schema='thirdproject'";
        
        db.query(sql, (err, results) => {
            if (err) {
                res.send(err);
            } else {
                const tables = results.filter(el => el.TABLE_NAME.match(/_media/) === null);

                if (kwarg === 'board' || kwarg === 'team') {
                    sql = kwarg === 'board'
                    ?`select b.board_id, p.personal_id, b.auth, b.title, c.category, b.content, b.create_date, b.modify_date, b.notice from board b inner join personal_info p on b.auth_id=p.personal_id inner join category c on b.category=c.category_id where board_id=${id}`
                    :`select * from team where team_id=${id}`;
                    
                    db.query(sql, (err, results) => {
                        if (err) {
                            res.send(err);
                        } else {
                            const instance = results[0];

                            if (kwarg === "board") {
                                sql = `select * from board_media where board_id=${instance.board_id}`

                                db.query(sql, (err, results) => {
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        const obj = {
                                            user: req.session.user.name,
                                            auth: req.session.user.auth,
                                            tables: tables,
                                            table: kwarg,
                                            instance: instance,
                                            media: results.length === 0? null : results,
                                            error: null
                                        }
                        
                                        res.render('admin_detail', obj);
                                    }
                                });
                            } else {
                                const obj = {
                                    user: req.session.user.name,
                                    auth: req.session.user.auth,
                                    tables: tables,
                                    table: kwarg,
                                    instance: instance,
                                    error: null
                                }
                
                                res.render('admin_detail', obj);
                            }
                        }
                    });
                } else if (kwarg === "category" || kwarg === "personal_info") {
                    sql = kwarg === "category"
                    ?`select * from category where category_id=${id}`
                    :`select * from personal_info where personal_id=${id}`;

                    db.query(sql, (err, results) => {
                        if (err) {
                            res.send(err);
                        } else {
                            const instance = results[0];

                            const obj = {
                                user: req.session.user.name,
                                auth: req.session.user.auth,
                                tables: tables,
                                table: kwarg,
                                instance: instance,
                                error: null
                            }
            
                            res.render('admin_detail', obj);
                        }
                    });
                }
            }
        });
    }
}).post('/:kwarg/:id', (req, res) => {
    if (!req.session.user) {
        res.redirect('/admin/login');
    } else if (req.session.user.auth !== 'admin') {
        res.send("You are not Admin!");
    } else {
        const kwarg = req.params.kwarg;
        const id = req.params.id;
        let sql = "select table_name from information_schema.tables where table_schema='thirdproject'";
        
        db.query(sql, (err, results) => {
            if (err) {
                res.send(err);
            } else {
                const tables = results.filter(el => el.TABLE_NAME.match(/_media/) === null);

                if (kwarg === 'team') {
                    const teamValues = Object.values(req.body).map((el, idx) => {
                        if (idx === 0) {
                            return el;
                        } else {
                            return parseInt(el);
                        }
                    });

                    if (Object.values(req.body).includes("") || !teamValid(teamValues)) {
                        const error = Object.values(req.body).includes("")
                        ? '입력되지 않은 값이 존재합니다.'
                        : '유효하지 않은 값이 존재합니다.';

                        sql = `select * from team where team_id=${id}`;

                        db.query(sql, (err, results) => {
                            if (err) {
                                res.send(err);
                            } else {
                                const obj = {
                                    user: req.session.user.name,
                                    auth: req.session.user.auth,
                                    tables: tables,
                                    table: kwarg,
                                    instance: results[0],
                                    error: error
                                }
                
                                res.render('admin_detail', obj);
                            }
                        });
                    } else {
                        const pl = teamValues[1] + teamValues[2] + teamValues[3];
                        const gd = teamValues[4] - teamValues[5];
                        const pts = teamValues[1] * 3 + teamValues[2];
                        const team = req.body.team;

                        sql = `update team set team="${team}", pl=${pl}, win=${teamValues[1]}, draw=${teamValues[2]}, lose=${teamValues[3]}, gf=${teamValues[4]}, ga=${teamValues[5]}, gd=${gd}, pts=${pts} where team_id=${id}`;

                        db.query(sql, (err) => {
                            if (err) {
                                res.send(err);
                            } else {
                                res.redirect(`/admin/${kwarg}/${id}`);
                            }
                        });
                    }
                } else if (kwarg === "category") {
                    if (Object.values(req.body).includes("")) {
                        sql = `select * from category where category_id=${id}`;

                        db.query(sql, (err, results) => {
                            if (err) {
                                res.send(err);
                            } else {
                                const instance = results[0];
    
                                const obj = {
                                    user: req.session.user.name,
                                    auth: req.session.user.auth,
                                    tables: tables,
                                    table: kwarg,
                                    instance: instance,
                                    error: "입력되지 않은 값이 존재합니다."
                                }
                
                                res.render('admin_detail', obj);
                            }
                        });
                    } else {
                        sql = `update category set category="${req.body.category}" where category_id=${id}`;

                        db.query(sql, (err) => {
                            if (err) {
                                res.send(err);
                            } else {
                                res.redirect(`/admin/${kwarg}/${id}`);
                            }
                        });
                    }
                } else if (kwarg === "personal_info") {
                    if (req.body.authority === "on") {
                        sql = `update personal_info set authority="admin" where personal_id=${id}`;

                        db.query(sql, (err) => {
                            if (err) {
                                res.send(err);
                            } else {
                                res.redirect(`/admin/${kwarg}`);
                            }
                        });
                    } else {
                        res.redirect(`/admin/${kwarg}/${id}`);
                    }
                }
            }
        });
    }
});

module.exports = router;