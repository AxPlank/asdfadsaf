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
        }

        const obj = {
            user: req.session.user["name"]
        };
        let sql = 'select distinct category from board';

        db.query(sql, (err, data) => {
            if (err) {
                console.log(err);

                obj["url"] = '/board';
                obj["error"] = 500;

                res.render('errorpage', obj);
            }

            const PostData = req.body;
            const isValid = PostValid(PostData);
            obj["PostData"] = PostData;
            obj["leagues"] = data;

            if (!isValid[0]) {
                obj["error"] = isValid[1];

                res.render('board/post', obj);
            } 
            sql = `insert into board (auth, title, category, content, create_date) values (?, ?, ?, ?, now())`;
            let values = [req.session.user["name"], PostData["title"], PostData["category"], PostData["content"]];

            db.query(sql, values, (err) => {
                if (err) {
                    console.log(err);

                    obj["url"] = '/board/post';
                    obj["error"] = 500;

                    res.render('errorpage', obj);
                }
            });

            sql = `select id from board where auth='${req.session.user["name"]}' order by id desc limit 1`;
            
            db.query(sql, (err, data) => {
                if (err) {
                    console.log(err);

                    obj["url"] = '/board/post';
                    obj["error"] = 500;

                    res.render('errorpage', obj);
                } else {
                    const board_id = data[0]["id"];

                    const Imagelimits = {
                        fields: 0,
                        fileSize: 10000000,
                        files: 10,
                    };
                    const ImagefileFilter = (req, file, cb) => {
                        if (file.mimetype.match(/^(image)/)) {
                            cb(null, true);
                        } else {
                            cb(null, false);
                        }
                    };
                    const ImageUpload = multer({
                        dest: `../boardmedia/${PostData.category.replace(/ /g, '_')}/image/`,
                        limits: Imagelimits,
                        fileFilter: ImagefileFilter,
                    }).array('Image', 10);
        
                    const Videolimits = {
                        fields: 0,
                        fileSize: 50000000,
                        files: 2,
                    };
                    const VideofileFilter = (req, file, cb) => {
                        if (file.mimetype.match(/^(video)/)) {
                            cb(null, true);
                        } else {
                            cb(null, false);
                        }
                    };
                    const VideoUpload = multer({
                        dest: `../boardmedia/${PostData.category.replace(/ /g, '_')}/video/`,
                        limits: Videolimits,
                        fileFilter: VideofileFilter,
                    }).array('Video', 2);

                    VideoUpload(req, res, (err) => {
                        if (err) {
                            sql = `delete from board where id='${board_id}'`;

                            db.query(sql, () => {});

                            res.render('board/post', obj);
                        }

                        for (let i = 0; i < req.files.length; i++) {
                            const FileExtension = req.files[i].originalname.substring(req.files[i].originalname.lastIndexOf('.'), req.files[i].originalname.length);
                        }
                    });
                }
            });
        });
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