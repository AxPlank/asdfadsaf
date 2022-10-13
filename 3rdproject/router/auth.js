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

    return router;
}