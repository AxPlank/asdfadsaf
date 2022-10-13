module.exports = () => {
    const router = require('express').Router();
    const db = require('../config/mysql')();

    router.get('/', (req, res) => {
        res.send('TEST');
    });

    return router;
}