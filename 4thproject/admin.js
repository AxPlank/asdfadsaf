"use strict"

const express = require('express');

const router = express.Router();

// Admin
router.get('/login', (req, res) => {
    if (!req.session.user) {
        res.render('login');
    } else if (req.session.user.auth !== 'admin') {
        res.send("You are not Admin!");
    } else {
        res.redirect('/admin/main');
    }
});

router.get('/main', (req, res) => {
    if (!req.session.user) {
        res.redirect('/admin/login');
    } else if (req.session.user.auth !== 'admin') {
        res.send("You are not Admin!");
    } else {
        res.render('main');
    }
});

module.exports = router;