module.exports = () => {
    const express = require('express');
    const app = express();

    app.listen(3003, () => {
        console.log('http://localhost:3003');
    });

    app.use(express.urlencoded({extended: false}));
    app.set('view engine', 'ejs');
    app.set('views', './views');

    app.get('/', (req, res) => {
        let str1, str2;
        console.log(req.query);

        if (req.query.test1) {
            str1 = req.query.test1;
        } else {
            str1 = "HI"
        }

        if (req.query.test2) {
            str2 = req.query.test2;
        } else {
            str2 ="HELLO";
        }

        const obj = {
            str1: str1,
            str2: str2
        }

        res.render('main', obj);
    });

    return app;
}