module.exports = () => {
    const router = require('express').Router();
    const db = require('../config/mysql')();

    router.get(['/', '/:league'], (req, res) => {
        let sql = 'select league from leagues';

        db.query(sql, (err, rows, fields) => {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            }
            else {
                const leagues = rows;
                const league = req.params.league.replace(/_/g, ' ');

                if (league) {
                    sql = `select * from teams where league='${league}' order by pts desc, gd desc, gf desc, team asc`;

                    db.query(sql, (err, rows, fields) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send("Internal Server Error");
                        } else {
                            const obj ={
                                leagues: leagues,
                                league_name: league,
                                teams: rows
                            };
                            
                            res.render('table/table_detail', obj);
                        }
                    });
                } else {
                    const obj = {
                        leagues: leagues
                    };

                    res.render('table/table', obj);
                }
            }
        });
    });

    return router;
}