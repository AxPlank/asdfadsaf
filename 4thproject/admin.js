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

// Admin
router.get('/login', (req, res) => {
    if (!req.session.user) {
        const obj = {
            error: false
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
                            user: data.nickname,
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

router.get('/main', (req, res) => {
    if (!req.session.user) {
        res.redirect('/admin/login');
    } else if (req.session.user.auth !== 'admin') {
        res.send("You are not Admin!");
    } else {
        let sql = "select table_name from information_schema.tables where table_schema='thirdproject'";
        
        db.query(sql, (err, rows) => {
            if (err) {
                res.send(err);
            } else {
                console.log(req.session.user);
                const table_name = rows.filter(el => el.TABLE_NAME.match(/_media/) === null);
                const obj = {
                    user: req.session.user.name,
                    auth: req.session.user.auth,
                    table_name: table_name
                }

                res.render('main', obj);
            }
        });
    }
});

module.exports = router;