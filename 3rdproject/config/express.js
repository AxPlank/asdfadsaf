module.exports = () => {
    const express = require('express');
    const app = express();
    const bodyParser = require('body-parser');
    const session = require('express-session');
    const MySQLStore = require('express-mysql-session')(session);

    app.listen(3003, () => {
        console.log(`Connected Port 3003
        http://localhost:3003/`);
    });

    app.locals.pretty = true;

    app.use(express.urlencoded({extended: false}));
    app.use(session({
        secret: 'sfjo313!$32$51kjfsdaf',
        resave: false,
        saveUninitialized: true,
        store: new MySQLStore({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'joongseok03@',
            database: 'thirdproject'
        })
    }));
    app.use(express.static('static'));
    app.use('/media', express.static('media'));
    app.use(express.json());
    // app.set('view', './views');
    // app.set('view engine', pug);
    app.set('views', './views_ejs');
    app.set('view engine', 'ejs');
    
    app.get('/', (req, res) => {
        const obj = {}

        if (req.session.user) {
            obj["user"] = req.session.user["name"];
        } else {
            obj["user"] = false;
        }

        res.render('main', obj);
    });
    
    return app;
}