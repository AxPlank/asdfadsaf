module.exports = () => {
    const router = require('express').Router();
    const db = require('../config/mysql')();

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
                    sql = `select * `;
                    res.send('board');
                } else {
                    sql = `select * from board where notice=1 order by id desc`;

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