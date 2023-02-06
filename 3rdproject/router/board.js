"use strict";

module.exports = () => {
    const router = require('express').Router();
    const db = require('../config/mysql')();
    const moment = require('../config/timezone')();
    const boardUpload = require('../config/multer')('board').fields([
        {name: 'boardimage', maxCount: 10},
        {name: 'boardvideo', maxCount: 2}
    ]);
    const fs = require('node:fs/promises');

    // 게시글 작성
    router.get('/post', (req, res) => {
        if (!req.session.user) {
            // 로그인하지 않으면 작성창으로 진입 안됨
            res.redirect('/auth/login');
        } else {
            // 페이지 상단 카테고리 출력 및 글 작성 때 사용할 select box 위한 쿼리문
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
                        error: null,
                        form: null,
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
                        url: `/board/post`,
                        error: 500,
                        user: req.session.user["name"]
                    }

                    res.render('errorpage', obj);
                } else {
                    boardUpload(req, res, (err) => {
                        if (err) {
                            const obj = {
                                url: `/board/post`,
                                error: 500,
                                user: req.session.user["name"]
                            }

                            res.render('errorpage', obj);
                        } else {
                            let form = req.body;
                            let leagues = datas;

                            if (Object.values(form).includes("")) {
                                unlinkBoard(req.files).then(() => {
                                    const obj = {
                                        error: "There exist that is not entered",
                                        leagues: leagues,
                                        user: req.session.user["name"],
                                        form: form
                                    }

                                    res.render('board/board_post', obj);
                                }).catch((reason) => {
                                    res.send(reason);
                                });
                            } else if (PostValid(form)) {
                                unlinkBoard(req.files).then(() => {
                                    const obj = {
                                        error: "Title is too long.",
                                        leagues: leagues,
                                        user: req.session.user.name,
                                        form: form
                                    }
            
                                    res.render('board/board_post', obj);
                                }).catch((reason) => {
                                    res.send(reason);
                                });
                            } else {
                                const subQueryBoardPost1 = `(select personal_id from personal_info where user_id='${req.session.user.user_id}')`;
                                const subQueryBoardPost2 = `(select category_id from category where category='${form.category}')`;
                                sql = `insert into board (auth_id, auth, title, category, content, create_date) values (${subQueryBoardPost1}, '${req.session.user.name}', '${form.title}', ${subQueryBoardPost2}, '${form.content}', now())`;
        
                                db.query(sql, (err) => {
                                    if (err) {
                                        const obj = {
                                            url: '/board',
                                            error: 500,
                                            user: req.session.user.name
                                        }
        
                                        res.render('errorpage', obj);
                                    } else {
                                        const subQueryBoardPost3 = `(select personal_id from personal_info where user_id='${req.session.user.user_id}')`
                                        sql = `select a.board_id, b.category from board a inner join category b on a.category=b.category_id where auth_id=${subQueryBoardPost3} order by board_id desc limit 1`;
        
                                        db.query(sql, (err, data) => {
                                            if (err) {
                                                const obj = {
                                                    url: '/board',
                                                    error: 500,
                                                    user: req.session.user.name
                                                }
                
                                                res.render('errorpage', obj);
                                            } else {
                                                const [boardCategory, boardId] = [data[0].category.replace(/ /g, '_'), data[0].board_id];
                                                let imageURL = [];
                                                let videoURL = [];

                                                if (req.files.boardimage) {
                                                    req.files.boardimage.map(async (e) => {
                                                        await fs.rename(`${e.destination}/${e.filename}`, `${e.destination}/${e.filename}.${e.mimetype.substring(e.mimetype.indexOf('/') + 1,)}`);
                                                        return e;
                                                    })
                                                    
                                                    imageURL = req.files.boardimage.map((e) => {
                                                        return `(${boardId}, 'image', '${e.destination}/${e.filename}.${e.mimetype.substring(e.mimetype.indexOf('/') + 1,)}')`;
                                                    });
                                                }

                                                if (req.files.boardvideo) {
                                                    req.files.boardvideo.map(async (e) => {
                                                        await fs.rename(`${e.destination}/${e.filename}`, `${e.destination}/${e.filename}.${e.mimetype.substring(e.mimetype.indexOf('/') + 1,)}`);
                                                        return e;
                                                    });

                                                    videoURL = req.files.boardvideo.map((e) => {
                                                        return `(${boardId}, 'video', '${e.destination}/${e.filename}.${e.mimetype.substring(e.mimetype.indexOf('/') + 1,)}')`;
                                                    });
                                                }

                                                if (imageURL.length !== 0) {
                                                    sql = `insert into board_media (board_id, media_type, URL) values ` + imageURL.join(', ');
                                                }

                                                if (videoURL.length !== 0) {
                                                    sql = sql + ', ' + videoURL.join(', ');
                                                }
                                                
                                                db.query(sql, (err) => {
                                                    if (err) {
                                                        const obj = {
                                                            url: '/board',
                                                            error: 500,
                                                            user: req.session.user.name
                                                        }
                        
                                                        res.render('errorpage', obj);
                                                    } else {
                                                        res.redirect(`/board/${boardId}`);
                                                    }
                                                })
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });

    router.get('/:id/edit', (req, res) => {
        let sql = `select category from category order by category asc`;

        db.query(sql, (err, datas) => {
            if (err) {
                const obj = {
                    url: `/board/${req.params.id}`,
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
                            url: `/board/${req.params.id}`,
                            error: 500,
                            user: req.session.user["name"]
                        }
        
                        res.render('errorpage', obj);
                    } else if (!req.session.user) {
                        res.redirect(`/auth/login`);
                    } else if (data[0].user_id !== req.session.user.user_id) {
                        res.redirect(`/board/${req.params.id}`);
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
                            board_media: false,
                            user: req.session.user["name"],
                            error: false
                        }
        
                        res.render('board/board_detail', obj);
                    } else {
                        const obj = {
                            leagues: leagues,
                            post: data[0],
                            form: data[0],
                            error: false,
                            user: req.session.user
                        }

                        res.render('board/board_edit', obj);
                    }
                });
            }
        });
    }).post('/:id/edit', (req, res) => {
        let sql = `select category from category order by category asc`;

        db.query(sql, (err, datas) => {
            if (err) {
                const obj = {
                    url: `/board/${req.params.id}`,
                    error: 500,
                    user: req.session.user["name"]
                }

                res.render('errorpage', obj);
            } else {
                let form = req.body;
                const leagues = datas;

                sql = `select a.board_id, b.user_id, c.category from board a inner join personal_info b on a.auth_id=b.personal_id inner join category c on a.category=c.category_id where board_id=${req.params.id}`;

                db.query(sql, (err, data) => {
                    if (err) {
                        console.log(err);
                        const obj = {
                            url: `/board/${req.params.id}`,
                            error: 500,
                            user: req.session.user["name"]
                        }
    
                        res.render('errorpage', obj);
                    } else if (!req.session.user) {
                        res.redirect(`/auth/login`);
                    } else if (data[0].user_id !== req.session.user.user_id) {
                        res.redirect(`/board/${req.params.id}`);
                    } else if (Object.values(form).includes("")) {
                        const obj = {
                            error: "There exist that is not entered",
                            leagues: leagues,
                            user: req.session.user.name,
                            post: data[0],
                            form: form
                        }
    
                        res.render('board/board_edit', obj);
                    } else if (PostValid(form)) {
                        const obj = {
                            error: "Title is too long.",
                            leagues: leagues,
                            user: req.session.user.name,
                            post: data[0],
                            form: form
                        }
    
                        res.render('board/board_edit', obj);
                    } else if (data.length === 0) {
                        const form = {
                            title: 'HTTP 404',
                            content: '존재하지 않는 게시글입니다.',
                            auth: 'admin',
                            category: 'Others',
                            create_date: new Date(),
                            modify_date: NaN
                        }
    
                        const obj = {
                            leagues: leagues,
                            board_media: false,
                            post: form,
                            user: req.session.user["name"]
                        }
    
                        res.render('board/board_detail', obj);
                    } else {
                        const subQueryBoardEdit = `(select category_id from category where category='${form.category}')`;
                        sql = `update board set title='${form.title}', category=${subQueryBoardEdit}, content='${form.content}', modify_date=now() where board_id=${req.params.id}`;

                        db.query(sql, (err) => {
                            if (err) {
                                console.log(err);
                                const obj = {
                                    url: `/board/${req.params.id}/edit`,
                                    error: 500,
                                    user: req.session.user.name
                                };

                                res.render('errorpage', obj);
                            } else {
                                res.redirect(`/board/${req.params.id}`);
                            }
                        });
                    }
                });
            }
        });
    });

    router.get('/:id/delete', (req, res) => {
        let sql = `select category from category order by category asc`;

        db.query(sql, (err, datas) => {
            if (err) {
                const obj = {
                    url: `/board/${req.params.id}`,
                    error: 500,
                    user: req.session.user["name"]
                }

                res.render('errorpage', obj);
            } else {
                const leagues = datas;
                sql = `select a.board_id, b.user_id, c.category from board a inner join personal_info b on a.auth_id=b.personal_id inner join category c on a.category=c.category_id where board_id=${req.params.id}`;

                db.query(sql, (err, data) => {
                    if (err) {
                        console.log(err);
                        const obj = {
                            url: `/board/${req.params.id}`,
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
                            category: 'Others',
                            board_media: false,
                            create_date: new Date(),
                            modify_date: NaN
                        }
        
                        const obj = {
                            leagues: leagues,
                            post: form,
                            user: req.session.user["name"]
                        }
    
                        res.render('board/board_detail', obj);
                    } else if (data[0].user_id !== req.session.user.user_id && req.session.user.auth !== 'admin') {
                        res.redirect(`/board/${req.params.id}`);
                    } else {
                        sql = `delete from board where board_id=${req.params.id}`;

                        db.query(sql, (err, datas) => {
                            if (err) {
                                const obj = {
                                    url: `/board/${req.params.id}`,
                                    error: 500,
                                    user: req.session.user["name"]
                                }
            
                                res.render('errorpage', obj);
                            } else {
                                res.redirect(`/board/${data[0].category}`);
                            }
                        });
                    }
                });
            }
        });
    });

    router.get('/:pk', (req, res) => {
        if (Number.isInteger(parseInt(req.params.pk))) {
            // 게시글 조회
            const pk = parseInt(req.params.pk);

            let sql = `select b.board_id, b.title, b.content, b.auth, b.create_date, b.modify_date, c.category, p.user_id from board b inner join category c on b.category=c.category_id inner join personal_info p on b.auth_id=p.personal_id where board_id=${pk}`;

            db.query(sql, (err, data) => {
                if (err) {
                    console.log(err);
                    const obj = {
                        error: 500,
                        url: '/board/main',
                        user: req.session.user?req.session.user.name:false
                    };

                    res.render('errorpage', obj);
                } else {
                    const post = data[0];
                    sql = `select media_type, URL from board_media where board_id=${pk}`;

                    db.query(sql, (err, data) => {
                        if (err) {
                            const obj = {
                                error: 500,
                                url: '/board/main',
                                user: req.session.user?req.session.user.name:false
                            };
        
                            res.render('errorpage', obj);
                        } else {
                            const obj = {
                                user: req.session.user?req.session.user.name:false,
                                error: false,
                                post: post,
                                board_media: data
                            }
                            
                            res.render('board/board_detail', obj);
                        }
                    });
                }
            });
        } else {
            // 전체 or 카테고리별 게시글 목록 조회 - 1페이지만
            const pk = req.params.pk;

            let sql = `select category from category order by category`;

            db.query(sql, (err, datas) => {
                if (err) {
                    const obj = {
                        error: 500,
                        url: '/',
                        user: req.session.user?req.session.user.name:false
                    };

                    res.render('errorpage', obj);
                } else {
                    const leagues = datas;
                    const subQueryBoardList1 = `(select category_id from category where category='${pk.replace(/_/g, ' ')}')`;

                    if (pk === "main") {
                        sql = `select count(board_id) as cntPost from board`;
                    } else {
                        sql = `select count(board_id) as cntPost from board where category=${subQueryBoardList1}`;
                    }

                    db.query(sql, (err, data) => {
                        if (err) {
                            const obj = {
                                error: 500,
                                url: '/',
                                user: req.session.user?req.session.user.name:false
                            };
    
                            res.render('errorpage', obj);
                        } else {
                            const lastPage = Math.ceil(data[0].cntPost / 10);

                            if (pk === "main") {
                                sql = `select rank() over (order by board_id asc) as no, b.board_id, b.title, b.content, b.auth, b.create_date, b.modify_date, c.category, p.user_id from board b inner join category c on b.category=c.category_id inner join personal_info p on b.auth_id=p.personal_id where notice=1 order by board_id desc limit 3`;
                            } else {
                                sql = `select rank() over (order by board_id asc) as no, b.board_id, b.title, b.content, b.auth, b.create_date, b.modify_date, c.category, p.user_id from board b inner join category c on b.category=c.category_id inner join personal_info p on b.auth_id=p.personal_id where notice=1 and c.category='${pk.replace(/_/g, ' ')}' order by board_id desc limit 3`;
                            }
            
                            db.query(sql, (err, datas) => {
                                if (err) {
                                    const obj = {
                                        error: 500,
                                        url: '/',
                                        user: req.session.user?req.session.user.name:false
                                    };
            
                                    res.render('errorpage', obj);
                                } else {
                                    const notices = datas;

                                    if (pk === "main") {
                                        sql = `select rank() over (order by board_id asc) as no, b.board_id, b.title, b.content, b.auth, b.create_date, b.modify_date, c.category, p.user_id from board b inner join category c on b.category=c.category_id inner join personal_info p on b.auth_id=p.personal_id order by board_id desc limit 10`;
                                    } else {
                                        sql = `select rank() over (order by board_id asc) as no, b.board_id, b.title, b.content, b.auth, b.create_date, b.modify_date, c.category, p.user_id from board b inner join category c on b.category=c.category_id inner join personal_info p on b.auth_id=p.personal_id where c.category='${pk.replace(/_/g, ' ')}' order by board_id desc limit 10`;
                                    }
    
                                    db.query(sql, (err, datas) => {
                                        if (err) {
                                            const obj = {
                                                error: 500,
                                                url: '/',
                                                user: req.session.user?req.session.user.name:false
                                            };
                    
                                            res.render('errorpage', obj);
                                        } else {
                                            const postlist = datas;
    
                                            const obj = {
                                                user: req.session.user?req.session.user.name:false,
                                                auth: req.session.user?req.session.user.auth:false,
                                                leagues: leagues,
                                                notices: notices,
                                                postlist: postlist,
                                                category: pk,
                                                currentPage: 1,
                                                lastPage: lastPage
                                            }
    
                                            res.render('board/board', obj);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    router.get('/', (req, res) => {
        const category = req.query.category;
        const currentPage = parseInt(req.query.page);
        const offset = (currentPage - 1) * 10;

        let sql = 'select category from category order by category';

        db.query(sql, (err, datas) => {
            if (err) {
                const obj = {
                    error: 500,
                    url: '/',
                    user: req.session.user?req.session.user.name:false
                };

                res.render('errorpage', obj);
            } else {
                const leagues = datas;
                if (category === "main") {
                    sql = `select rank() over (order by board_id asc) as no, b.board_id, b.title, b.content, b.auth, b.create_date, b.modify_date, c.category, p.user_id from board b inner join category c on b.category=c.category_id inner join personal_info p on b.auth_id=p.personal_id where notice=1 order by board_id desc limit 3`;
                } else {
                    sql = `select rank() over (order by board_id asc) as no, b.board_id, b.title, b.content, b.auth, b.create_date, b.modify_date, c.category, p.user_id from board b inner join category c on b.category=c.category_id inner join personal_info p on b.auth_id=p.personal_id where notice=1 and c.category='${category.replace(/_/g, ' ')}' order by board_id desc limit 3`;
                }

                db.query(sql, (err, datas) => {
                    if (err) {
                        const obj = {
                            error: 500,
                            url: '/',
                            user: req.session.user?req.session.user.name:false
                        };
        
                        res.render('errorpage', obj);
                    } else {
                        const notices = datas;
                        const subQueryBoardList2 = `(select category_id from category where category='${category.replace(/_/g, ' ')}')`;
                        
                        if (category === "main") {
                            sql = `select count(board_id) as cntPost from board`;
                        } else {
                            sql = `select count(board_id) as cntPost from board where category=${subQueryBoardList2}`;
                        }
                        
                        db.query(sql, (err, data) => {
                            if (err) {
                                const obj = {
                                    error: 500,
                                    url: '/',
                                    user: req.session.user?req.session.user.name:false
                                };
                
                                res.render('errorpage', obj);
                            } else {
                                const lastPage = Math.ceil(data[0].cntPost / 10);

                                if (category === "main") {
                                    sql = `select rank() over (order by board_id asc) as no, b.board_id, b.title, b.content, b.auth, b.create_date, b.modify_date, c.category, p.user_id from board b inner join category c on b.category=c.category_id inner join personal_info p on b.auth_id=p.personal_id order by board_id desc limit ${offset}, 10`;
                                } else {
                                    sql = `select rank() over (order by board_id asc) as no, b.board_id, b.title, b.content, b.auth, b.create_date, b.modify_date, c.category, p.user_id from board b inner join category c on b.category=c.category_id inner join personal_info p on b.auth_id=p.personal_id where c.category='${category.replace(/_/g, ' ')}' order by board_id desc limit ${offset}, 10`;
                                }

                                db.query(sql, (err, datas) => {
                                    if (err) {
                                        const obj = {
                                            error: 500,
                                            url: '/',
                                            user: req.session.user?req.session.user.name:false
                                        };
                        
                                        res.render('errorpage', obj);
                                    } else {
                                        const postlist = datas;

                                        const obj = {
                                            user: req.session.user?req.session.user.name:false,
                                            auth: req.session.user?req.session.user.auth:false,
                                            leagues: leagues,
                                            notices: notices,
                                            postlist: postlist,
                                            category: category,
                                            currentPage: currentPage,
                                            lastPage: lastPage
                                        }

                                        res.render('board/board', obj);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    function insertBoardMedia(files) {
        const promise = new Promise(async (resolve, rejects) => {
            let file, fileslen;

            if (files.boardimage) {
                file = files.boardimage
                fileslen = files.boardimage.length;

                for (let i = 0; i < fileslen; i++) {
                    fs.unlink(`${file[i].destination}/${file[i].filename}`).then(() => {
                        console.log("Deleted");
                    }).catch((reason) => {
                        console.log(reason);
                        throw reason;
                    });
                }
            }

            if (files.boardvideo) {
                file = files.boardvideo
                fileslen = files.boardvideo.length;

                for (let i = 0; i < fileslen; i++) {
                    fs.unlink(`${file[i].destination}/${file[i].filename}`).then(() => {
                        console.log("Deleted");
                    }).catch((reason) => {
                        console.log(reason);
                        throw reason;
                    });
                }
            }

            resolve();
        });

        return promise;
    }

    function unlinkBoard(files) {
        const promise = new Promise(async (resolve, rejects) => {
            let file, fileslen;

            if (files.boardimage) {
                file = files.boardimage
                fileslen = files.boardimage.length;

                for (let i = 0; i < fileslen; i++) {
                    fs.unlink(`${file[i].destination}/${file[i].filename}`).then(() => {
                        console.log("Deleted");
                    }).catch((reason) => {
                        console.log(reason);
                        throw reason;
                    });
                }
            }

            if (files.boardvideo) {
                file = files.boardvideo
                fileslen = files.boardvideo.length;

                for (let i = 0; i < fileslen; i++) {
                    fs.unlink(`${file[i].destination}/${file[i].filename}`).then(() => {
                        console.log("Deleted");
                    }).catch((reason) => {
                        console.log(reason);
                        throw reason;
                    });
                }
            }

            resolve();
        });

        return promise;
    }

    function PostValid(obj) {
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


    return router;
}