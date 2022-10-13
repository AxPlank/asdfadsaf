module.exports = () => {
    const router = require('express').Router();
    const db = require('../config/mysql')();

    router.get(['/', '/:league'], (req, res) => {
        let sql = 'select league from leagues';

        db.query(sql, (err, rows, fields) => {
            if (err) {
                console.log(err);
                
                const obj = {
                    url: `/`,
                    error: 500
                }

                res.render('errorpage', obj);
            }
            else {
                const leagues = rows;

                if (req.params.league) {
                    const league = req.params.league.replace(/_/g, ' ');
                    sql = `select * from teams where league='${league}' order by pts desc, gd desc, gf desc, team asc`;

                    db.query(sql, (err, rows, fields) => {
                        if (err) {
                            console.log(err);

                            const obj = {
                                url: `/table`,
                                error: 500
                            }

                            res.render('errorpage', obj);
                        } else {
                            const obj ={
                                leagues: leagues,
                                league_name: league,
                                teams: rows
                            };

                            if (req.session.user) {
                                obj["user"] = req.session.user["name"];
                                obj["auth"] = req.session.user["auth"];
                            }
                            
                            res.render('table/table_detail', obj);
                        }
                    });
                } else {
                    const obj = {
                        leagues: leagues
                    };

                    if (req.session.user) {
                        obj["user"] = req.session.user["name"];
                    }

                    res.render('table/table', obj);
                }
            }
        });
    });

    router.get('/edit/:league/:team', (req, res) => {
        if (!req.session.user) {
            res.redirect(`/table/${req.params.league}`);
        } else if (req.session.user["auth"] !== 'admin') {
            res.redirect(`/table/${req.params.league}`);
        } else {
            let sql = `select * from teams where team='${req.params.team.replace(/_/g, ' ')}'`;

            db.query(sql, (err, data, fields) => {
                if (err) {
                    console.log(err);

                    const obj = {
                        user: req.session.user["name"],
                        url: `/table/${req.params.league}`,
                        error: 500
                    }

                    res.render('errorpage', obj);
                } else if (data.length === 0) {
                    const obj = {
                        user: req.session.user["name"],
                        url: `/table/${req.params.league}`,
                        error: 404
                    }

                    res.render('errorpage', obj);
                } else {
                    const obj = {
                        user: req.session.user["name"],
                        auth: req.session.user["auth"],
                        team: data[0]
                    }

                    res.render('table/table_edit', obj);
                }
            });
        }
    }).post('/edit/:league/:team', (req, res) => {
        if (!req.session.user) {
            res.redirect(`/table/${req.params.league}`);
        } else if (req.session.user["auth"] !== 'admin') {
            res.redirect(`/table/${req.params.league}`);
        } else if (Object.values(req.body).includes('')) {
            const obj = {
                user: req.session.user["name"],
                url: `/table/edit/${req.params.league}/${req.params.team}`,
                error: 400
            };

            res.render('errorpage', obj);
        } else {
            const values = Object.values(req.body).map(Number);

            for (let value of values) {
                console.log(value);
                if (!value) {
                    const obj = {
                        user: req.session.user["name"],
                        url: `/table/edit/${req.params.league}/${req.params.team}`,
                        error: 400
                    };

                    res.render('errorpage', obj);
                }
            }

            let pts = values[1] * 3 + values[2];
            let sql = `update teams set pl=?, win=?, draw=?, lose=?, gf=?, ga=?, gd=?, pts=? where team='${req.params.team.replace(/_/g, ' ')}'`;

            db.query(sql, [...values, pts], (err, data) => {
                if (err) {
                    console.log(err);
                    
                    const obj = {
                        user: req.session.user["name"],
                        url: `/table/edit/${req.params.league}/${req.params.team}`,
                        error: 500
                    };

                    res.render('errorpage', obj);
                } else {
                    res.redirect(`/table/${req.params.league}`);
                }
            });
        }
    });

    router.get('/add', (req, res) => {
        res.send('tested');
    });

    return router;
}