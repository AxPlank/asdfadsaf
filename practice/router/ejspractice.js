module.exports = () => {
    const express = require('express');
    const app = express();

    app.listen(3003, () => {
        console.log("HELLO Papus!");
        console.log(`http://localhost:3003/`);
    });

    app.set('view engine', 'ejs');
    app.set('views', './views/ejs');
    app.use(express.urlencoded({extended: false}));

    app.get('/', (req, res) => {
        res.render('main', {name: "Papus"});
    });

    app.get('/postpractice', (req, res) => {
        res.render('form');
    }).post('/postparctice', (req, res) => {
        res.render('main', req.body);
    });

    return app;
}