module.exports = () => {
    const router = require('express').Router();
    const db = require('../config/mysql')();

    router.get('/:league/add', (req, res) => {
        if (!req.session.user) {
            res.redirect(`/table/${req.params.league}`);
        } else if (req.session.user["auth"] !== 'admin') {
            res.redirect(`/table/${req.params.league}`);
        } else {
            const obj = {
                league: req.params.league
            };

            res.render('table/table_add', obj);
        }
    }).post('/:league/add', (req, res) => {
        if (!req.session.user) {
            res.redirect(`/table/${req.params.league}`);
        } else if (req.session.user["auth"] !== 'admin') {
            res.redirect(`/table/${req.params.league}`);
        } else if (Object.values(req.body).includes("")) {
            const obj = {
                user: req.session.user["name"],
                url: `/table/${req.params.league}/${req.params.team}/edit`,
                error: 400
            };

            res.render('errorpage', obj);
        } else {
            const body = Object.values(req.body)
                .map((el, idx) => {
                    if (idx === 0) {
                        return el;
                    } else {
                        return parseInt(el);
                    }
                });

            if (isValidValue(body)) {
                const obj = {
                    user: req.session.user["name"],
                    url: `/table/${req.params.league}/${req.params.team}/edit`,
                    error: 400
                };

                res.render('errorpage', obj);
            }

            const team = body[0];
            const league = req.params.league.replace(/_/g, ' ');
            const values = body.slice(1, body.length);
            const pl = values.slice(0, 3).reduce((previous, current) => previous + current, 0);
            const pts = values[0] * 3 + values[1];
            const gd = values[3] - values[4];

            const sql = `insert into teams (team, league, pl, win, draw, lose, gf, ga, gd, pts) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            db.query(sql, [team, league, pl, ...values, gd, pts], (err, data) => {
                if (err) {
                    console.log(err);
                    
                    const obj = {
                        user: req.session.user["name"],
                        url: `/table/${req.params.league}/${req.params.team}/edit`,
                        error: 500
                    };

                    res.render('errorpage', obj);
                } else {
                    res.send("success");
                }
            });
        }
    });

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

    router.get('/:league/:team/edit', (req, res) => {
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
    }).post('/:league/:team/edit', (req, res) => {
        if (!req.session.user) {
            res.redirect(`/table/${req.params.league}`);
        } else if (req.session.user["auth"] !== 'admin') {
            res.redirect(`/table/${req.params.league}`);
        } else if (Object.values(req.body).includes('')) {
            const obj = {
                user: req.session.user["name"],
                url: `/table/${req.params.league}/${req.params.team}/edit`,
                error: 400
            };

            res.render('errorpage', obj);
        } else {
            const body = Object.values(req.body).map(Number);

            if (isValidValue(body)) {
                const obj = {
                    user: req.session.user["name"],
                    url: `/table/${req.params.league}/${req.params.team}/edit`,
                    error: 400
                };

                res.render('errorpage', obj);
            }

            const pl = body.slice(0, 3).reduce((previous, current) => previous + current, 0);
            const pts = body[0] * 3 + body[1];
            const gd = body[3] - body[4];
            const sql = `update teams set pl=?, win=?, draw=?, lose=?, gf=?, ga=?, gd=?, pts=? where team='${req.params.team.replace(/_/g, ' ')}'`;

            db.query(sql, [pl, ...values, gd, pts], (err, data) => {
                if (err) {
                    console.log(err);
                    
                    const obj = {
                        user: req.session.user["name"],
                        url: `/table/${req.params.league}/${req.params.team}/edit`,
                        error: 500
                    };

                    res.render('errorpage', obj);
                } else {
                    res.redirect(`/table/${req.params.league}`);
                }
            });
        }
    });

    router.get('/:league/:team/delete', (req, res) => {
        if (!req.session.user) {
            res.redirect(`/table/${req.params.league}`);
        } else if (req.session.user["auth"] !== 'admin') {
            res.redirect(`/table/${req.params.league}`);
        } else {
            const team = req.params.team.replace(/_/g, ' ');
            const sql = `delete from teams where team='${team}'`;

            db.query(sql, (err, data) => {
                if (err) {
                    console.log(err);
                    
                    const obj = {
                        user: req.session.user["name"],
                        url: `/table/${req.params.league}/${req.params.team}/edit`,
                        error: 500
                    };

                    res.render('errorpage', obj);
                } else {
                    res.redirect(`/table/${req.params.league}`);
                }
            });
        }
    });

    return router;
}

function isValidValue(arr) {
    for (let el of arr) {
        if (!el && el !== 0) {
            console.log(el);
            return true;
        }
    }

    return false;
}