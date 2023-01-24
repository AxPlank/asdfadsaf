"use strict"

const express = require('express');
const mysql = require('mysql');

const app = express();
const auth = express.Router();
const admin = express.Router();

// app
app.listen(3003, () => {
    console.log("http://localhost:3003");
});
app.use('admin', admin);
app.use('admin', auth);
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.set('views', '/views');

// MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'joongseok03@',
    port: 3306,
    database: 'thirdproject'
});

// auth
auth.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/admin/main');
    } else {
        res.render('/auth/login');
    }
}).post('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/admin/main');
    }

    if 
});