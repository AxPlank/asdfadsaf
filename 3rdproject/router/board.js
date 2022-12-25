module.exports = () => {
    const router = require('express').Router();
    const db = require('../config/mysql')();
    const fs = require('fs');

    router.get('/post', (req, res) => {
        if (!req.session.user) {
            res.redirect('/auth/login');
        } else {
            let sql = 'select distinct category from board';

            db.query(sql, (err, data) => {
                if (err) {
            
                    const obj = {
                        url: `/board/board_post`,
                        error: 500,
                        user: req.session.user["name"]
                    };

                    res.render('errorpage', obj);
                } else {
                    const obj = {
                        leagues: data,
                        user: req.session.user["name"]
                    }
                
                    res.render('board/board_post', obj);
                }
            });
        }
    }).post('/post', (req, res) => {
        if (!req.session.user) {
            res.redirect('/auth/login');
        } else {
        }
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
                                url: `/board`,
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
                                            url: `/board/${req.params.category}`,
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
                            }
                        }
                    });
                }
            });
        }
    });

    return router;
}