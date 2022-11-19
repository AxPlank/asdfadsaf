module.exports = () => {
    const router = require('express').Router();
    const db = require('../config/mysql')();
    const multer = require('multer');
    const fs = require('fs');

    router.get('/post', (req, res) => {
        if (!req.session.user) {
            res.redirect('/auth/login');
        } else {
            let sql = 'select distinct category from board';

            db.query(sql, (err, data) => {
                const obj = {
                    leagues: data,
                    user: req.session.user["name"]
                };
                
                if (err) {
                    console.log(err);
            
                    const obj = {
                        url: `/board`,
                        error: 500
                    };

                    res.render('errorpage', obj);
                }
                
                res.render('board/post', obj);
            });
        }
    }).post('/post', (req, res) => {
        if (!req.session.user) {
            res.redirect('/board');
        } else {
            const PostData = req.body;
            const isValid = PostValid(PostData);
            let sql = 'select distinct category from board category';

            db.query(sql, (err, data) => {
                if (err) {
                    console.log(err);
                    
                    const obj = {
                        user: req.session.user["name"],
                        url: '/board/post',
                        error: 500
                    }

                    res.render('errorpage', obj);
                }

                if (!isValid[0]) {
                    const obj = {
                        error: isValid[1],
                        user: req.session.user["name"],
                        leagues: data
                    };  
    
                    res.render('board/post', obj);
                } else {
                    res.send("Creating Post API");
                }
            });
        }
    });

    router.get(['/', '/:category', '/:category/:id'], (req, res) => {
        let sql = 'select distinct category from board order by category';

        db.query(sql, (err, data) => {
            if (err) {
                console.log(err);
        
                const obj = {
                    url: `/`,
                    error: 500
                };

                if (req.session.user) {
                    obj["user"] = req.session.user["name"];
                }

                res.render('errorpage', obj);
            } else {
                const obj = {
                    leagues: data
                };

                if (req.params.category && req.params.id) {
                    sql = `select * from board where id='${req.params.id}'`;

                    db.query(sql, (err, data) => {
                        if (err) {
                            obj["url"] = '/';
                            obj["error"] = 500;
        
                            if (req.session.user) {
                                obj["user"] = req.session.user["name"];
                            }
        
                            res.render('errorpage', obj);
                        } else {
                            obj["post"] = data[0];

                            if (req.session.user) {
                                obj["user"] = req.session.user["name"];
                                obj["auth"] = req.session.user["auth"];
                                obj["authentication"] = req.session.user["authentication"];
                            }

                            res.render('board/board_detail', obj);
                        }
                    });
                } else {
                    sql = `select * from board where notice=1 order by id desc limit 3`;

                    db.query(sql, (err, datas) => {
                        if (err) {
                            obj["url"] = '/';
                            obj["error"] = 500;
        
                            if (req.session.user) {
                                obj["user"] = req.session.user["name"];
                            }
        
                            res.render('errorpage', obj);
                        } else {
                            obj["notices"] = datas;

                            if (req.params.category) {
                                const category = req.params.category.replace(/_/g, ' ');
                                sql = `select * from board where category='${category}' order by id desc`;

                                db.query(sql, (err, datas) => {
                                    if (err) {
                                        obj["url"] = '/';
                                        obj["error"] = 500;

                                        if (req.session.user) {
                                            obj["user"] = req.session.user["name"];
                                        }
        
                                        res.render('errorpage', obj);
                                    } else {
                                        obj["postlist"] = datas;

                                        if (req.session.user) {
                                            obj["user"] = req.session.user["name"];
                                            obj["auth"] = req.session.user["auth"];
                                            obj["authentication"] = req.session.user["authentication"];
                                        }

                                        res.render('board/board', obj);
                                    }
                                });
                            } else {
                                sql = 'select * from board order by id desc';

                                db.query(sql, (err, datas) => {
                                    if (err) {
                                        obj["url"] = '/';
                                        obj["error"] = 500;

                                        if (req.session.user) {
                                            obj["user"] = req.session.user["name"];
                                        }
        
                                        res.render('errorpage', obj);
                                    } else {
                                        obj["postlist"] = datas;

                                        if (req.session.user) {
                                            obj["user"] = req.session.user["name"];
                                            obj["auth"] = req.session.user["auth"];
                                            obj["authentication"] = req.session.user["authentication"];
                                        }

                                        res.render('board/board', obj);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        })
    });

    return router;
}

function PostValid(obj) {
    if (obj["title"] === '' || obj["title"] === '') {
        return [false, 'You need to write a title and content.'];
    }
    
    const Title = obj["title"];
    const TitleLen = obj["title"].length;
    const AlphabetPattern = /[A-Za-z]/;
    const NumberPattern = /[0-9]/;
    let i = TitleByte = 0;

    while (i < TitleLen) {
        if (Title[i].match(AlphabetPattern) || Title[i].match(NumberPattern)) {
            TitleByte += 1;
        } else {
            TitleByte += 2;
        }

        if (TitleByte > 200) {
            return [false, 'Title is too long'];
        }

        i++;
    }

    return [true];
}