module.exports = () => {
    const router = require('express').Router();
    const db = require('../config/mysql')();
    const fs = require('fs');

    router.get('/post', (req, res) => {
        if (!req.session.user) {
            res.redirect('/auth/login');
        } else {
            let sql = 'select distinct category from board order by category asc';

            db.query(sql, (err, datas) => {
                if (err) {
                    console.log(err);
            
                    const obj = {
                        url: `/board`,
                        error: 500,
                        user: req.session.user.name
                    };

                    res.render('errorpage', obj);
                } else {
                    const obj = {
                        leagues: datas,
                        user: req.session.user.name
                    };

                    res.render('board/board_post', obj);
                }
            });
        }
    }).post('/post', (req, res) => {
        if (!req.session.user) {
            res.redirect('/auth/login');
        } else {
            let sql = 'select distinct category from board order by category asc';

            db.query(sql, (err, datas) => {
                if (err) {
                    const obj = {
                        url: `/board`,
                        error: 500,
                        user: req.session.user["name"]
                    }

                    res.render('errorpage', obj);
                } else {
                    let form = req.body;
                    let leagues = datas;

                    if (Object.values(form).includes("")) {
                        const obj = {
                            error: "There exist that is not entered",
                            leagues: leagues,
                            user: req.session.user.name,
                            form: form
                        }

                        res.render('board/board_post', obj);
                    } else if (PostValid(form)) {
                        const obj = {
                            error: "Title is too long.",
                            leagues: leagues,
                            user: req.session.user.name,
                            form: form
                        }

                        res.render('board/board_post', obj);
                    } else {
                        sql = `insert into board (auth_id, auth, title, category, content, create_date) values ('${req.session.user.user_id}', '${req.session.user.name}', '${form.title}', '${form.category}', '${form.content}', now())`;

                        db.query(sql, (err, datas) => {
                            if (err) {
                                const obj = {
                                    url: '/board',
                                    error: 500,
                                    user: req.session.user.name
                                }

                                res.render('errorpage', obj);
                            } else {
                                sql = `select id, category from board where auth_id='${req.session.user.user_id}' order by id desc limit 1`;

                                db.query(sql, (err, data) => {
                                    if (err) {
                                        const obj = {
                                            url: '/board',
                                            error: 500,
                                            user: req.session.user.name
                                        }
        
                                        res.render('errorpage', obj);
                                    } else {
                                        res.redirect(`/board/${data[0].category.replace(/ /g, '_')}/${data[0].id}`)
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });

    router.get('/:category/:id/edit', (req, res) => {
        let sql = `select auth_id from board where id=${parseInt(req.params.id)}`;

        db.query(sql, (err, data) => {
            if (err) {
                const obj = {
                    url: `/board/${req.params.category}/${req.params.id}`,
                    error: 500,
                    user: req.session.user["name"]
                }

                res.render('errorpage', obj);
            } else if (data[0].auth_id !== req.session.user.user_id) {
                res.redirect(`/board/${req.params.category}/${req.params.id}`);
            } else if (!req.session.user) {
                res.redirect(`/auth/login`);
            } else {
                sql = `select distinct category from board order by category asc`;

                db.query(sql, (err, datas) => {
                    if (err) {
                        const obj = {
                            url: `/board/${req.params.category}/${req.params.id}`,
                            error: 500,
                            user: req.session.user["name"]
                        }
        
                        res.render('errorpage', obj);
                    } else {
                        const leagues = datas;
                        sql = `select * from board where id=${req.params.id}`;
                        
                        db.query(sql, (err, data) => {
                            if (err) {
                                const obj = {
                                    url: `/board/${req.params.category}/${req.params.id}`,
                                    error: 500,
                                    user: req.session.user["name"]
                                }
                
                                res.render('errorpage', obj);
                            } else {
                                const obj = {
                                    user: req.session.user.name,
                                    leagues: leagues,
                                    form: data[0],
                                }

                                res.render('board/board_edit', obj);
                            }
                        });
                    }
                });
            }
        });
    }).post('/:category/:id/edit', (req, res) => {
        let sql = `select auth_id from board where id=${req.params.id}`;

        db.query(sql, (err, data) => {
            if (err) {
                const obj = {
                    url: `/board/${req.params.category}/${req.params.id}`,
                    error: 500,
                    user: req.session.user["name"]
                }

                res.render('errorpage', obj);
            } else if (data[0].auth_id !== req.session.user.user_id) {
                res.redirect(`/board/${req.params.category}/${req.params.id}`);
            } else if (!req.session.user) {
                res.redirect(`/auth/login`);
            } else {
                sql = `select distinct category from board order by category asc`;

                db.query(sql, (err, datas) => {
                    if (err) {
                        const obj = {
                            url: `/board/${req.params.category}/${req.params.id}`,
                            error: 500,
                            user: req.session.user["name"]
                        }
        
                        res.render('errorpage', obj);
                    } else {
                        let form = req.body;
                        let leagues = datas;

                        if (Object.values(form).includes("")) {
                            const obj = {
                                error: "There exist that is not entered",
                                leagues: leagues,
                                user: req.session.user.name,
                                form: form
                            }

                            res.render('board/board_post', obj);
                        } else if (PostValid(form)) {
                            const obj = {
                                error: "Title is too long.",
                                leagues: leagues,
                                user: req.session.user.name,
                                form: form
                            }

                            res.render('board/board_post', obj);
                        } else {
                            sql = `update board set title='${form.title}', content='${form.content}', category='${form.category}', modify_date=now() where id=${req.params.id}`;
                        
                            db.query(sql, (err, data) => {
                                if (err) {
                                    const obj = {
                                        url: `/board/${req.params.category}/${req.params.id}`,
                                        error: 500,
                                        user: req.session.user["name"]
                                    }
                
                                    res.render('errorpage', obj);
                                } else {
                                    res.redirect(`/board/${req.params.category}/${req.params.id}`);
                                }
                            });
                        }
                    }
                });
            }
        });
    });

    router.get('/:category/:id/delete', (req, res) => {
        let sql = `select auth_id from board where id=${req.params.id}`;

        db.query(sql, (err, data) => {
            if (err) {
                const obj = {
                    url: `/board/${req.params.category}/${req.params.id}`,
                    error: 500,
                    user: req.session.user["name"]
                }

                res.render('errorpage', obj);
            } else if (data[0].auth_id !== req.session.user.user_id) {
                res.redirect(`/board/${req.params.category}/${req.params.id}`);
            } else if (!req.session.user) {
                res.redirect(`/auth/login`);
            } else {
                sql = `delete from board where id=${req.params.id}`;

                db.query(sql, (err, datas) => {
                    if (err) {
                        const obj = {
                            url: `/board/${req.params.category}/${req.params.id}`,
                            error: 500,
                            user: req.session.user["name"]
                        }
        
                        res.render('errorpage', obj);
                    } else {
                        res.redirect(`/board/${req.params.category}`)
                    }
                });
            }
        });
    });

    router.get(['/', '/:category', '/:category/:id'], (req, res) => {
        if (req.params.category && req.params.id) {
            let sql = `select * from board where id='${parseInt(req.params.id)}'`;

            db.query(sql, (err, data) => {
                if (err) {
                    const obj = {
                        url: `/board/${req.params.category}`,
                        error: 500
                    }

                    if (req.session.user) {
                        obj["user"] = req.session.user;
                    }
                    
                    res.render('errorpage', obj);
                } else {
                    const obj = {
                        post: data[0],
                    }

                    if (req.session.user) {
                        obj["auth"] = req.session.user["auth"];
                        obj["user"] = req.session.user["name"];
                    }

                    res.render('board/board_detail', obj);
                }
            });
        } else {
            let sql = 'select distinct category from board order by category asc';

            db.query(sql, (err, datas) => {
                if (err) {
                    const obj = {
                        url: `/board`,
                        error: 500
                    }

                    if (req.session.user) {
                        obj["user"] = req.session.user["name"];
                    }

                    res.render('errorpage', obj);
                } else {
                    const leagues = datas;
                    sql = 'select * from board where notice=1 order by id desc';

                    db.query(sql, (err, datas) => {
                        if (err) {
                            const obj = {
                                url: `/`,
                                error: 500
                            }
        
                            if (req.session.user) {
                                obj["user"] = req.session.user["name"];
                            }
        
                            res.render('errorpage', obj);
                        } else {
                            const notices = datas;

                            if (req.params.category) {
                                sql = `select * from board where category='${req.params.category.replace(/_/g, ' ')}' order by id desc`;

                                db.query(sql, (err, datas) => {
                                    if (err) {
                                        console.log(err);
                                        const obj = {
                                            url: `/board`,
                                            error: 500
                                        }
                    
                                        if (req.session.user) {
                                            obj["user"] = req.session.user["name"];
                                        }
                    
                                        res.render('errorpage', obj);
                                    } else {
                                        const obj = {
                                            leagues: leagues,
                                            notices: notices,
                                            postlist: datas
                                        }

                                        if (req.session.user) {
                                            obj["user"] = req.session.user["name"];
                                            obj["auth"] = req.session.user["auth"];
                                        }

                                        res.render('board/board', obj);
                                    }
                                });
                            } else {
                                sql = `select * from board order by id desc`;

                                db.query(sql, (err, datas) => {
                                    if (err) {
                                        console.log(err);
                                        const obj = {
                                            url: `/`,
                                            error: 500
                                        }
                    
                                        if (req.session.user) {
                                            obj["user"] = req.session.user["name"];
                                        }
                    
                                        res.render('errorpage', obj);
                                    } else {
                                        const obj = {
                                            leagues: leagues,
                                            notices: notices,
                                            postlist: datas
                                        }

                                        if (req.session.user) {
                                            obj["user"] = req.session.user["name"];
                                            obj["auth"] = req.session.user["auth"];
                                        }

                                        res.render('board/board', obj);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });

    function PostValid(obj) {
        const Title = obj["title"];
        const TitleLen = obj["title"].length;
        const koreanPattern = /[ㄱ-ㅎ|가-힣]+$/;
        let i = TitleByte = 0;
    
        while (i < TitleLen) {
            if (Title[i].match(koreanPattern)) {
                TitleByte += 2;
            } else {
                TitleByte += 1;
            }
    
            if (TitleByte > 200) {
                return true;
            }
    
            i++;
        }
    
        return false;
    }


    return router;
}