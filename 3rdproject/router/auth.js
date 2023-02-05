"use strict";

module.exports = () => {
    const router = require('express').Router();
    const sha256 = require('sha256');
    const db = require('../config/mysql')();

    // 로그인
    router.get('/login', (req, res) => {
        if (req.session.user) {
            // session에 user가 존재한다는 것은 이미 로그인이 되어 있다는 상태
            res.redirect('/');
        } else {
            const obj = {
                user: null,
                error: null,
                form: null,
                error: null
            }

            res.render('auth/login', obj);
        }
    }).post('/login', (req, res) => {
        if (req.session.user) {
            res.redirect('/');
        } else {
            let form = req.body;

            if (Object.values(form).includes("")) {
                // ID/PW 중 하나 이상이 입력되지 않은 경우
                const obj = {
                    user: null,
                    error: 'There exist that is not entered',
                    form: form
                }

                res.render('auth/login', obj);
            } else {
                let sql = `select user_id, pw, nickname, authority, secret_key from personal_info where user_id='${form.id}'`;

                db.query(sql, (err, data, field) => {
                    if (err) {
                        const obj = {
                            user: null,
                            error: 500,
                            url: '/auth/login'
                        }

                        res.render('errorpage', obj);
                    } else if (data.length === 0 || data[0].pw !== sha256(form.password + data[0].secret_key)){
                        // ID가 존재하지 않거나, 비밀번호가 틀린 경우
                        const obj = {
                            user: false,
                            error: 'ID/PW does not match.',
                            form: form
                        }

                        res.render('auth/login', obj);
                    } else {
                        // 일치하는 ID를 가진 회원 존재 + 비밀번호도 일치
                        req.session.user = {
                            user_id: data[0].user_id,
                            name: data[0].nickname,
                            auth: data[0].authority
                        }

                        res.redirect('/');
                    }
                })
            }
        }
    });

    // 로그아웃
    router.get('/logout', (req, res) => {
        if (req.session.user) {
            // session에 저장되어 있는 user객체를 지워, 로그인 해제
            delete req.session.user;
            res.redirect('/');
        } else {
            res.redirect('/auth/login');
        }
    });

    // 회원가입
    router.get('/signup', (req, res) => {
        if (req.session.user) {
            res.redirect('/auth/mypage');
        } else {
            const obj = {
                user: null,
                UserData: null,
                error: null
            }

            res.render('auth/signup', obj);
        }
    }).post('/signup', (req, res) => {
        const UserData = req.body;

        // 핸드폰 번호 검사 패턴
        const PatternPhone = /^(010)(\d{3,4})(\d{4})/;

        if (Object.values(UserData).includes("")) {
            // 입력되지 않은 항목 존재
            const obj = {
                user: null,
                UserData: UserData,
                error: 'There exist that is not entered.'
            }

            res.render('auth/signup', obj);
        } else if (UserData["password"].length < 8) {
            // 비밀번호 길이가 유효하지 않을 때
            const obj = {
                user: null,
                UserData: UserData,
                error: "Password is not valid."
            }

            res.render('auth/signup', obj);
        } else if (UserData["password"] !== UserData["checkpassword"]) {
            // 확인 차 입력한 비밀번호와 설정하고자 하는 비밀번호가 일치하지 않을 때
            const obj = {
                user: null,
                UserData: UserData,
                error: "Password is not match."
            }

            res.render('auth/signup', obj);
        } else if (!UserData.phone.match(PatternPhone) || UserData.phone[3] === '1') {
            // 유효하지 않은 핸드폰 번호일 때
            const obj = {
                user: null,
                UserData: UserData,
                error: "Phone number is not valid."
            }

            res.render('auth/signup', obj);
        } else if (UserData["id"].length >= 5 && UserData["id"].length <= 12 && UserData["id"].match(/\W/)) {
            // ID의 길이가 유효하지 않을 때
            const obj = {
                user: null,
                UserData: UserData,
                error: "ID is not valid."
            }

            res.render('auth/signup', obj);
        } else if (UserData["nickname"].match(/\W/) || UserData["nickname"].length >= 20 || UserData["nickname"].length <= 5) {
            // 닉네임이 유효하지 않을 때
            const obj = {
                user: false,
                UserData: UserData,
                error: "Nickname is not valid."
            }

            res.render('auth/signup', obj);
        } else {
            // 비밀 키 획득
            const SerectKey = getSecretKey();
            // 비밀번호 암호화
            const PW = sha256(UserData["password"] + SerectKey);
            const Phone = UserData.phone;

            // 입력된 정보를 가지고 있는 회원이 이미 존재하는지 확인하기 위한 쿼리문
            let sql = `select * from personal_info where user_id='${UserData.id}' or nickname='${UserData.nickname}' or email='${UserData.email}' or phone_number='${Phone}'`;

            db.query(sql, (err, datas) => {
                if (err) {
                    const obj = {
                        user: null,
                        url: `/auth/signup`,
                        error: 500
                    };

                    res.render('errorpage', obj);
                } else if (datas.length !== 0) {
                    // ID/닉네임/이메일/폰 번호를 가진 데이터가 하나 이상 검출되었을 때 → 이미 가입한 회원으로 판단
                    const obj = {
                        user: null,
                        UserData: UserData,
                        error: "There is already exist one of ID, Nickname, Phone and Email."
                    }

                    res.render('auth/signup', obj);
                } else {
                    // 회원정보 저장하기 위한 쿼리
                    const SqlArr = [UserData["id"], PW, UserData["nickname"], UserData["email"], Phone, SerectKey];
                    sql = `insert into personal_info (user_id, pw, nickname, email, phone_number, secret_key) values (${SqlArr.map((e) => {return `'${e}'`;}).join(", ")})`;

                    db.query(sql, (err, data) => {
                        if (err) {
                            const obj = {
                                user: null,
                                url: `/auth/signup`,
                                error: 500
                            };

                            res.render('errorpage', obj);
                        } else {
                            // 회원정보 저장하면서, session에도 정보 등록해 자동적으로 로그인되게 진행
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

    // 마이페이지
    router.get('/mypage', (req, res) => {
        if (req.session.user) {
            // DB에서 회원정보 조회하기 위한 쿼리
            let sql = `select * from personal_info where nickname='${req.session.user["name"]}'`;

            db.query(sql, (err, data) => {
                if (err) {
                    const obj = {
                        user: req.session.user["name"],
                        url: `/`,
                        error: 500
                    };

                    res.render('errorpage', obj);
                } else {
                    const obj = {
                        user: req.session.user["name"],
                        UserData: data[0]
                    };

                    res.render('auth/mypage', obj);
                }
            });
        } else {
            res.redirect('/auth/login');
        }
    });

    // 비밀번호 변경
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
                // 입력하지 않은 항목이 존재할 때
                const obj = {
                    error: 'There exist that is not entered.',
                    user: req.session.user["name"]
                };
    
                res.render('auth/change', obj);
            } else if (req.body["newpassword"].length < 8) {
                // 비밀번호의 길이가 유효하지 않을 때
                const obj = {
                    error: "New Password do not valid",
                    user: req.session.user["name"]
                };
    
                res.render('auth/change', obj);
            } else if (req.body["newpassword"] === req.body["password"]) {
                // 이전 비밀번호와 새 비밀번호가 일치할 때
                const obj = {
                    error: "You cannot change the password to the same password as your current password.",
                    user: req.session.user["name"]
                };
    
                res.render('auth/change', obj);
            } else if (req.body["newpassword"] !== req.body["checknewpassword"]) {
                // 확인 차 입력한 비밀번호와 설정하고자 하는 비밀번호가 일치하지 않을 때
                const obj = {
                    error: "New Password is not match",
                    user: req.session.user["name"]
                };
    
                res.render('auth/change', obj);
            } else {
                // 이전 데이터 조회 및 비밀번호 변경에 사용할 비밀 키 검색 쿼리
                let sql = `select pw, secret_key from personal_info where nickname='${req.session.user["name"]}'`;
    
                db.query(sql, (err, data) => {
                    if (err) {
                        const obj = {
                            user: req.session.user["name"],
                            url: `/auth/change`,
                            error: 500
                        };
    
                        res.render('errorpage', obj);
                    } else {
                        const CurrentPassword = sha256(req.body["password"] + data[0]["secret_key"]);
    
                        if (CurrentPassword !== data[0]["pw"]) {
                            // 입력한 현재 비밀번호와 데이터베이스에 저장된 현재 비밀번호가 다를 경우
                            const obj = {
                                error: "Password is not valid",
                                user: req.session.user["name"]
                            };
                
                            res.render('auth/change', obj);
                        } else {
                            // 새 비밀번호 암호화
                            const NewPassword = sha256(req.body["newpassword"] + data[0]["secret_key"]);
                            // 비밀번호 저장용 쿼리
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
                                    res.redirect('/auth/mypage');
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

    // 회원 탈퇴
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
        if (req.session.user) {
            // 데이터 삭제용 쿼리
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

    // 로그인 용 비밀키 생성 함수
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