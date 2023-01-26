"use strict"

const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const app = express();

// MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'joongseok03@',
    port: 3306,
    database: 'thirdproject'
});

// app
app.listen(3003, () => {
    console.log("http://localhost:3003/admin/login");
});
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
        database: 'session_db'
    })
}));
app.set('view engine', 'ejs');
app.set('views', './views');

// Router
const admin = require('./admin');
app.use('/admin', admin);