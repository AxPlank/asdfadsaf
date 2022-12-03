module.exports = () => {
    const router = require('express').Router();
    const db = require('../config/mysql')();
    const fs = require('fs');
    const moment = require('../config/moment')();
    const upload = require('../config/multer')('boardUpload');

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
            console.log(`Entered Upload`);
            let sql = 'select distinct category from board';
            
            db.query(sql, (err, data) => {
                if (err) {
                    console.log(err);

                    const obj = {
                        user: req.session.user["name"],
                        url: '/board/post',
                        error: 500
                    };

                    res.render('errorpage', obj);
                } else {
                    const leagues = data;
                    upload(req, res, (err) => {
                        if (err) {
                            console.log(err);
                            res.send(`${err}`);
                        } else {
                            // 1st. isValid
                            const PostData = req.body;
                            const isValid = PostValid(PostData);

                            if (!isValid[0]) {
                                try {
                                    deleteFile(req.files).then((result) => {
                                        console.log(result);

                                        const obj = {
                                            user: req.session.user["name"],
                                            error: isValid[1],
                                            leagues: leagues,
                                            PostData: PostData
                                        }

                                        return new Promise((resolve, reject) => {
                                            res.render('board/post', obj);
                                        });
                                    }).then(() => {
                                        console.log("Success");
                                    });
                                } catch (err) {
                                    res.send(err);
                                }
                            } else {
                                // 2nd. Save req.body
                                sql = `insert into board (auth_id, auth, title, category, content, create_date) values (?, ?, ?, ?, ?, ?)`;
                                console.log(moment());
                                let sqlArr = [req.session.user["id"], req.session.user["name"], PostData["title"], PostData["category"], PostData["content"], moment()]

                                res.send(`${sqlArr.join(' * ')}`);
                            }
                            // res.send(req.files.image[0]);
                        }
                    });
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
        });
    });

    function PostValid(obj) {
        if (obj["title"] === '' || obj["content"] === '') {
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

    function getFileData(files) {
        let fileDataArr = [];

        if (files.image) {
            const cntImg = files.image.length;

            for (let i = 0; i < cntImg; i++) {
                const image = files.image[i];

                fs.unlink(image.destination + '/' + image.filename, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Deleted");
                    }
                });
            }
        }

        if (files.video) {
            const cntVid = files.video.length;

            for (let i = 0; i < cntVid; i++) {
                const video = files.video[i];

                fs.unlink(video.destination + '/' + video.filename, () => {
                    console.log("Deleted.");
                });
            }
        }

        return fileDataArr;
    }

    function deleteFile(files) {
        const deleteFilePromise = new Promise((resolve, reject) => {
            let result;

            if (files.image) {
                const cntImg = files.image.length;
    
                for (let i = 0; i < cntImg; i++) {
                    const image = files.image[i];
    
                    fs.unlink(image.destination + '/' + image.filename, (err) => {
                        if (err) {
                            console.log(err);
                            result = err;
                            reject(result);
                        } else {
                            console.log('hello');
                        }
                    });
                }
            }
    
            if (files.video) {
                const cntVid = files.video.length;
    
                for (let i = 0; i < cntVid; i++) {
                    const video = files.video[i];
    
                    fs.unlink(video.destination + '/' + video.filename, (err) => {
                        if (err) {
                            console.log(err);
                            result = err;
                            reject(result);
                        }
                    });
                }
            }
            
            result = "Deleted"
            resolve(result);
        });

        return deleteFilePromise;
    }

    return router;
}