module.exports = () => {
    const exportsjs = require('./exportjs');
    const express = require('express');
    const app = express();

    app.listen(3003, () => {
        console.log('http://localhost:3003/');
    });
    app.use(express.urlencoded({extended: false}));
    app.use(express.json());

    app.get('/', (req, res) => {
        res.status(200).send(`
        <form method='post' action='/post'>
            <input type="text" name="hello">
            <input type="checkbox" value="1" name="first">
            <input type="checkbox" value="2" name="second">
            <input type="checkbox" value="3" name="third">
            <input type="submit" value="SUBMIT">
        </form>
        `);
    });

    app.post('/post', (req, res) => {
        console.log(req.body);
        res.status(200).send(req.body);
    });

    return app;
}