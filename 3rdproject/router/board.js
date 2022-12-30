const { send } = require('process');

module.exports = () => {
    const router = require('express').Router();
    const db = require('../config/mysql')();

    router.get('/post', (req, res) => {
        if (!req.session.user) {
            res.redirect('/auth/login');
        } else {
            let sql = 'select category from category order by category asc';

            db.query(sql, (err, datas) => {
                if (err) {
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
            let sql = 'select category from category order by category asc';

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
                        const subQueryBoardPost1 = `(select personal_id from personal_info where user_id='${req.session.user.user_id}')`;
                        const subQueryBoardPost2 = `(select category_id from category where category='${form.category}')`;
                        sql = `insert into board (auth_id, auth, title, category, content, create_date) values (${subQueryBoardPost1}, '${req.session.user.name}', '${form.title}', ${subQueryBoardPost2}, '${form.content}', now())`;

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
        let sql = `select category from category order by category asc`;

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
                sql = `select a.board_id, a.auth, a.title, a.content, a.create_date, a.modify_date, b.category, c.user_id from board a inner join category b on a.category=b.category_id inner join personal_info c on a.auth_id=c.personal_id where board_id=${req.params.id}`;

                db.query(sql, (err, data) => {
                    if (err) {
                        const obj = {
                            url: `/board/${req.params.category}/${req.params.id}`,
                            error: 500,
                            user: req.session.user["name"]
                        }
        
                        res.render('errorpage', obj);
                    } else if (!req.session.user) {
                        res.redirect(`/auth/login`);
                    } else if (data.length === 0) {
                        const form = {
                            title: 'HTTP 404',
                            content: '존재하지 않는 게시글입니다.',
                            auth: 'admin',
                            category: req.params.category.replace(/_/g, ' '),
                            create_date: new Date(),
                            modify_date: NaN
                        }
        
                        const obj = {
                            leagues: leagues,
                            post: form,
                            user: req.session.user["name"]
                        }
        
                        res.render('board/board_detail', obj);
                    } else if (data[0].user_id !== req.session.user.user_id) {
                        res.redirect(`/board/${req.params.category}/${req.params.id}`);
                    } else {
                        const obj = {
                            leagues: leagues,
                            form: data[0],
                            user: req.session.user
                        }

                        res.render('board/board_edit', obj);
                    }
                });
            }
        });
    }).post('/:category/:id/edit', (req, res) => {
        let sql = `select category from category order by category asc`;

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
                const leagues = datas;

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
                    sql = `select a.board_id, b.user_id from board a inner join personal_info b on a.auth_id=b.personal_id where board_id=${req.params.id}`;

                    db.query(sql, (err, data) => {
                        if (err) {
                            const obj = {
                                url: `/board/${req.params.category}/${req.params.id}`,
                                error: 500,
                                user: req.session.user["name"]
                            }
        
                            res.render('errorpage', obj);
                        } else if (!req.session.user) {
                            res.redirect(`/auth/login`);
                        } else if (data.length === 0) {
                            const form = {
                                title: 'HTTP 404',
                                content: '존재하지 않는 게시글입니다.',
                                auth: 'admin',
                                category: req.params.category.replace(/_/g, ' '),
                                create_date: new Date(),
                                modify_date: NaN
                            }
        
                            const obj = {
                                leagues: leagues,
                                post: form,
                                user: req.session.user["name"]
                            }
        
                            res.render('board/board_detail', obj);
                        } else if (data[0].user_id !== req.session.user.user_id) {
                            res.redirect(`/board/${req.params.category}/${req.params.id}`);
                        } else {
                            const subQueryBoardEdit = `(select category_id from category where category='${form.category}')`;
                            sql = `update board set title='${form.title}', category=${subQueryBoardEdit}, content='${form.content}' where board_id=${req.params.id}`;

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
                    });
                }
            }
        });
    });

    router.get('/:category/:id/delete', (req, res) => {
        let sql = `select category from category order by category asc`;

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
                sql = `select a.board_id, b.user_id from board a inner join personal_info b on a.auth_id=b.personal_id where board_id=${req.params.id}`;

                db.query(sql, (err, data) => {
                    if (err) {
                        const obj = {
                            url: `/board/${req.params.category}/${req.params.id}`,
                            error: 500,
                            user: req.session.user["name"]
                        }
        
                        res.render('errorpage', obj);
                    } else if (!req.session.user) {
                        res.redirect(`/auth/login`);
                    } else if (data.length === 0) {
                        const form = {
                            title: 'HTTP 404',
                            content: '존재하지 않는 게시글입니다.',
                            auth: 'admin',
                            category: req.params.category.replace(/_/g, ' '),
                            create_date: new Date(),
                            modify_date: NaN
                        }
        
                        const obj = {
                            leagues: leagues,
                            post: form,
                            user: req.session.user["name"]
                        }
    
                        res.render('board/board_detail', obj);
                    } else if (data[0].user_id !== req.session.user.user_id) {
                        res.redirect(`/board/${req.params.category}/${req.params.id}`);
                    } else {
                        sql = `delete from board where board_id=${req.params.id}`;

                        db.query(sql, (err, data) => {
                            if (err) {
                                const obj = {
                                    url: `/board/${req.params.category}/${req.params.id}`,
                                    error: 500,
                                    user: req.session.user["name"]
                                }
            
                                res.render('errorpage', obj);
                            } else {
                                res.redirect(`/board/${req.params.category}`);
                            }
                        });
                    }
                });
            }
        });
    });

    router.get(['/', '/:category', '/:category/:id'], (req, res) => {
        if (req.params.category && req.params.id) {
            let sql = `select a.board_id, a.auth, a.title, a.content, a.create_date, a.modify_date, b.category from board a inner join category b on a.category=b.category_id where board_id=${req.params.id}`;

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
                } else if (data.length === 0) {
                    const form = {
                        title: 'HTTP 404',
                        content: '존재하지 않는 게시글입니다.',
                        auth: 'Admin',
                        category: req.params.category.replace(/_/g, ' '),
                        create_date: new Date(),
                        modify_date: NaN
                    }
    
                    const obj = {
                        post: form
                    }
    
                    if (req.session.user) {
                        obj["auth"] = req.session.user["auth"];
                        obj["user"] = req.session.user["name"];
                    }
    
                    res.render('board/board_detail', obj);
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
            let sql = 'select distinct category from category order by category asc';

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
                    sql = `select a.board_id, a.auth, a.title, a.content, a.create_date, b.category from board a inner join category b on a.category=b.category_id where notice=1 order by board_id desc limit 3`;

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
                                sql = `select a.board_id, a.auth, a.title, a.content, a.create_date, b.category from board a inner join category b on a.category=b.category_id where b.category='${req.params.category.replace(/_/g, ' ')}' order by board_id desc`;

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
                                sql = `select a.board_id, a.auth, a.title, a.content, a.create_date, b.category from board a inner join category b on a.category=b.category_id order by board_id desc`;

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