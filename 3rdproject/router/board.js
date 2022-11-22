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
                            const Postdata = req.body;
                            const isValid = PostValid(req.body);
                            const filelist = getFiles(req.files);
                            console.log(filelist);
                            console.log(isValid);
                            console.log(Postdata);

                            if (!isValid[0]) {
                                deleteFile(filelist).then(() => {
                                    const obj = {
                                        PostData: Postdata,
                                        user: req.session.user["name"],
                                        error: isValid[1],
                                        leagues: leagues
                                    };

                                    res.render('board/post', obj);
                                });
                            } else {
                                changeName(req.files, filelist).then(() => {
                                    sql = 'insert into board (auth_id, auth, title, category, content, create_date) values (?, ?, ?, ?, ?, now())';
                                    let SqlArr = [req.session.user["user_id"], req.session.user["name"], Postdata["title"], Postdata["category"], Postdata["content"]];

                                    db.query(sql, SqlArr, (err, data) => {
                                        if (err) {
                                            console.log(err);

                                            deleteFile(filelist).then(() => {
                                                const obj = {
                                                    user: req.session.user["name"],
                                                    url: '/board/post',
                                                    error: 500
                                                };

                                                res.render('errorpage', obj);
                                            });
                                        } else {
                                            res.send("TEST");
                                        }
                                    });
                                });
                            }
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
    
    function getFiles(files) {
        const filelist = [];
    
        if (files["image"]){
            for (let i = 0; i < files["image"].length; i++) {
                filelist.push(files["image"][i]["filename"]);
            }
        }
    
        if (files["video"]){
            for (let i = 0; i < files["video"].length; i++) {
                filelist.push(files["video"][i]["filename"]);
            }
        }
    
        return filelist;
    }

    async function deleteFile (files) {
        for(let i = 0; i < files.length; i++) {
            fs.unlink(`./boardmedia/${moment().format('YYYYMMDD')}/${files[i]}`, () => {
                console.log('Delete');
            });
        }
    }

    async function changeName (files, filenames) {
        if (files["image"]){
            for (let i = 0; i < files["image"].length; i++) {
                const FileExtension = files["image"][i].originalname.substring(files["image"][i].originalname.lastIndexOf('.'), files["image"][i].originalname.length);
                const basic_path = `./boardmedia/${moment().format('YYYYMMDD')}/${files["image"][i].filename}`;

                fs.rename(basic_path, basic_path + FileExtension, () => {
                    console.log("Change");
                });

                filenames[i] = filenames[i] + FileExtension;
            }
        }
    
        if (files["video"]){
            const cntImage = files["image"] ? files["image"].length : 0;

            for (let i = 0; i < files["video"].length; i++) {
                const FileExtension = files["video"][i].originalname.substring(files["video"][i].originalname.lastIndexOf('.'), files["video"][i].originalname.length);
                const basic_path = `./boardmedia/${moment().format('YYYYMMDD')}/${files["video"][i].filename}`;

                fs.rename(basic_path, basic_path + FileExtension, () => {
                    console.log("Change");
                });

                filenames[i + cntImage] = filenames[i + cntImage] + FileExtension;
            }
        }
        console.log(filenames);
    }

    return router;
}