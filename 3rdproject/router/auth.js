module.exports = () => {
    const router = require('express').Router();
    const sha256 = require('sha256');
    const db = require('../config/mysql')();

    router.get('/login', (req, res) => {
        if (req.session.user) {
            res.redirect('/');
        } else {
            res.render('auth/login');
        }
    }).post('/login', (req, res) => {
        if (req.session.user) {
            res.redirect('/');
        } else {
            let form = req.body;

            if (Object.values(form).includes("")) {
                const obj = {
                    error: 'There exist that is not entered',
                }

                res.render('auth/login', obj);
            } else {
                let sql = `select * from personal_info where user_id='${form.id}'`;

                db.query(sql, (err, data, field) => {
                    if (err) {
                        const obj = {
                            error: 500,
                            url: '/auth/login'
                        }

                        res.render('errorpage', obj);
                    } else if (data.length === 0 || data[0].pw !== sha256(form.password + data[0].secrect_key)){
                        const obj = {
                            error: 'ID/PW does not match.',
                        }

                        res.render('auth/login', obj);
                    } else {
                        req.session.user = {
                            user_id: data[0].user_id,
                            name: data[0].nickname,
                            auth: data[0].authority
                        }

                        console.log(req.session.user);

                        res.redirect('/');
                    }
                })
            }
        }
    });

    router.get('/logout', (req, res) => {
        delete req.session.user;
        res.redirect('/');
    });

    router.get('/signup', (req, res) => {
        if (req.session.user) {
            res.redirect('/');
        } else {
            res.render('auth/signup');
        }
    }).post('/signup', (req, res) => {
        const UserData = req.body;
        console.log(UserData["nickname"].length);

        const obj = {
            UserData: UserData,
        };

        const PatternPhone1 = /\d{3}/;
        const PatternPhone2 = /\d{4}/;

        if (Object.values(UserData).includes("")) {
            obj["error"] = 'There exist that is not entered.';

            res.render('auth/signup', obj);
        } else if (UserData["password"].length < 8) {
            obj["error"] = "Password is not valid.";

            res.render('auth/signup', obj);
        } else if (UserData["password"] !== UserData["checkpassword"]) {
            obj["error"] = "Password is not match.";

            res.render('auth/signup', obj);
        } else if (UserData["phone1"] !== '010' || !(UserData["phone2"].match(PatternPhone1) ^ UserData["phone2"].match(PatternPhone2)) || UserData["phone2"][0] === '1' || !UserData["phone3"].match(PatternPhone2)) {
            obj["error"] = "Phone number is not valid.";

            res.render('auth/signup', obj);
        } else if (UserData["id"].length >= 5 && UserData["id"].length <= 12 && UserData["id"].match(/\W/)) {
            obj["error"] = "ID is not valid.";

            res.render('auth/signup', obj);
        } else if (UserData["nickname"].match(/\W/) || UserData["nickname"].length >= 20 || UserData["nickname"].length <= 5) {
            console.log(true);
            obj["error"] = "Nickname is not valid.";

            res.render('auth/signup', obj);
        } else {
            const SerectKey = getSecretKey();
            const PW = sha256(UserData["password"] + SerectKey);
            const Phone = UserData["phone1"] + UserData["phone2"] + UserData["phone3"];
            let sql = `select * from personal_info where user_id='${UserData.id}' or nickname='${UserData.nickname}' or email='${UserData.email}' or phone_number='${Phone}'`;

            db.query(sql, (err, datas) => {
                if (err) {
                    const obj = {
                        url: `/auth/signup`,
                        error: 500
                    };

                    res.render('errorpage', obj);
                } else if (datas.length !== 0) {
                    console.log(datas);
                    obj["error"] = "There is already exist one of ID, Nickname, Phone and Email.";

                    res.render('auth/signup', obj);
                } else {
                    SqlArr = [UserData["id"], PW, UserData["nickname"], UserData["email"], Phone, SerectKey];
                    sql = `insert into personal_info (user_id, pw, nickname, email, phone_number, secrect_key) values (${SqlArr.map((e) => {return `'${e}'`;}).join(", ")})`;

                    db.query(sql, (err, data) => {
                        if (err) {
                            console.log(err);
                
                            const obj = {
                                url: `/auth/signup`,
                                error: 500
                            };

                            res.render('errorpage', obj);
                        } else {
                            req.session.user = {
                                user_id: UserData["id"],
                                name: UserData["nickname"],
                                auth: 'user',
                            };

                            res.redirect('/');
                        }
                    });
                }
            });
        }
    });

    router.get('/mypage', (req, res) => {
        if (req.session.user) {
            let sql = `select * from personal_info where nickname='${req.session.user["name"]}'`;

            db.query(sql, (err, data) => {
                if (err) {
                    console.log(err);
            
                    const obj = {
                        user: req.session.user["name"],
                        url: `/auth/signup`,
                        error: 500
                    };

                    res.render('errorpage', obj);
                } else {
                    
                    const obj = {
                        user: req.session.user["name"],
                        id: data[0]["user_id"],
                        nickname: data[0]["nickname"],
                        phone: data[0]["phone_number"],
                        email: data[0]["email"],
                    };

                    res.render('auth/mypage', obj);
                }
            });
        } else {
            res.redirect('/auth/login');
        }
    });

    router.get('/change', (req, res) => {
        if (req.session.user) {
            const obj = {
                user: req.session.user["name"]
            };

            res.render('auth/change', obj);
        } else {
            res.redirect('/auth/login');
        }
    }).post('/change', (req, res) => {
        if (req.session.user) {
            if (Object.values(req.body).includes('')) {
                const obj = {
                    error: 'There exist that is not entered.',
                    user: req.session.user["name"]
                };
    
                res.render('auth/change', obj);
            } else if (req.body["newpassword"].length < 8) {
                const obj = {
                    error: "New Password do not valid",
                    user: req.session.user["name"]
                };
    
                res.render('auth/change', obj);
            } else if (req.body["newpassword"] === req.body["password"]) {
                const obj = {
                    error: "You cannot change the password to the same password as your current password.",
                    user: req.session.user["name"]
                };
    
                res.render('auth/change', obj);
            } else if (req.body["newpassword"] !== req.body["checknewpassword"]) {
                const obj = {
                    error: "New Password is not match",
                    user: req.session.user["name"]
                };
    
                res.render('auth/change', obj);
            } else {
                let sql = `select pw, secrect_key from personal_info where nickname='${req.session.user["name"]}'`;
    
                db.query(sql, (err, data) => {
                    if (err) {
                        const obj = {
                            user: req.session.user["name"],
                            url: `/auth/change`,
                            error: 500
                        };
    
                        res.render('errorpage', obj);
                    } else {
                        const CurrentPassword = sha256(req.body["password"] + data[0]["secrect_key"]);
    
                        if (CurrentPassword !== data[0]["pw"]) {
                            const obj = {
                                error: "Password is not valid",
                                user: req.session.user["name"]
                            };
                
                            res.render('auth/change', obj);
                        } else {
                            const NewPassword = sha256(req.body["newpassword"] + data[0]["secrect_key"]);
                            sql = `update personal_info set pw='${NewPassword}' where nickname='${req.session.user["name"]}'`;
                            
                            db.query(sql, (err, data) => {
                                if (err)  {
                                    const obj = {
                                        user: req.session.user["name"],
                                        url: `/auth/change`,
                                        error: 500
                                    };
                
                                    res.render('errorpage', obj);
                                } else {
                                    res.redirect('/');
                                }
                            });
                        }
                    }
                });
            }
        } else {
            res.redirect('/auth/login');
        }
    });

    router.get('/leave', (req, res) => {
        if (req.session.user) {
            const obj = {
                user: req.session.user["name"]
            };

            res.render('auth/leave', obj);
        } else {
            res.redirect('/auth/login');
        }
    });

    router.get('/yes', (req, res) => {
        if (!req.session.user) {
            let sql = `delete from personal_info where nickname='${req.session.user["name"]}'`;

            db.query(sql, (err, data) => {
                if (err)  {
                    console.log(err);
                    
                    const obj = {
                        user: req.session.user["name"],
                        url: `/auth/leave`,
                        error: 500
                    };

                    res.render('errorpage', obj);
                } else {
                    delete req.session.user;

                    res.redirect('/');
                }
            });
        } else {
            res.redirect('/auth/login');
        }
    });

    function getSecretKey() {
        let result = '';
        let strr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()<>?[]{}';
        let strrlen = strr.length;
    
        for (let i = 0; i < 12; i++) {
            result += strr[Math.floor(Math.random() * strrlen)];
        }
    
        return result;
    }

    return router;
}