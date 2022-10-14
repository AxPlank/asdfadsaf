module.exports = () => {
    const router = require('express').Router();
    const sha256 = require('sha256');
    const db = require('../config/mysql')();

    router.get('/login', (req, res) => {
        const obj = {}
        
        if (req.session.user) {
            obj["user"] = req.session.user["name"];
        }

        res.render('auth/login', obj);
    }).post('/login', (req, res) => {
        if (!req.body.id) {
            console.log(1);
            const obj = {
                error: 'Please enter your ID'
            }

            res.render('auth/login', obj);
        }

        if (!req.body.password) {
            const obj = {
                error: 'Please enter your Password'
            }

            res.render('auth/login', obj);
        }

        let sql = `select * from personal_info where id='${req.body.id}'`;

        db.query(sql, (err, data, fields) => {
            if (err) {
                console.log(err);

                const obj = {
                    url: '/auth/login',
                    error: 500
                }

                res.render('errorpage', obj);
            } else if (data.length === 0) {
                const obj = {
                    error: "You entered wrong ID"
                }

                res.render('auth/login', obj);
            } else {
                let pw = data[0]["pw"];
                let [pw_input, secrect_key] = [req.body.password, data[0]["secrect_key"]];
                let encrypted_pw = sha256(pw_input + secrect_key);

                if (pw === encrypted_pw) {
                    req.session.user = {
                        name: data[0]["nickname"],
                        auth: data[0]["authority"],
                    }

                    res.redirect('/');
                } else {
                    const obj = {
                        error: "You entered wrong password"
                    };

                    res.render('auth/login', obj);
                }
            }
        })
    });

    router.get('/logout', (req, res) => {
        delete req.session.user;
        res.redirect('/');
    });

    router.get('/signup', (req, res) => {
        const obj = {};

        if (req.session.user) {
            obj["user"] = req.session.user["name"];
        }

        res.render('auth/signup', obj);
    }).post('/signup', (req, res) => {
        const UserData = req.body;

        const obj = {
            UserData: UserData,
        };

        const PatternPhone1 = /\d{3}/;
        const PatternPhone2 = /\d{4}/;

        if (Object.values(UserData).includes("")) {
            obj["error"] = "You should be write all items no exception.";

            res.render('auth/signup', obj);
        } else if (UserData["id"].length < 5 || UserData["password"] < 8) {
            obj["error"] = "ID/Password is not valid.";

            res.render('auth/signup', obj);
        } else if (UserData["password"] !== UserData["checkpassword"]) {
            obj["error"] = "Password is not match.";

            res.render('auth/signup', obj);
        } else if (UserData["phone1"] !== '010' || !(UserData["phone2"].match(PatternPhone1) ^ UserData["phone2"].match(PatternPhone2)) || UserData["phone2"][0] === '1' || !UserData["phone3"].match(PatternPhone2)) {
            obj["error"] = "Phone number is not valid.";

            res.render('auth/signup', obj);
        }

        const phone = UserData["phone1"] + UserData["phone2"] + UserData["phone3"];

        const PatternID = /d/;
    });

    return router;
}

function getSecretKey() {
    let result = '';
    let strr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()<>?[]{}';
    let strrlen = strr.length;

    for (let i = 0; i < 12; i++) {
        result += strr[Math.floor(Math.random() * strrlen)];
    }

    return result;
}