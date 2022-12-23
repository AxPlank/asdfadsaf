/**
 * Config
 */
const app = require('./config/express')();
const db = require('./config/mysql')();
const fs = require('fs');

/**
 * Router
 */
const table = require('./router/table')();
const auth = require('./router/auth')();
const board = require('./router/board')();

app.use('/table', table);
app.use('/auth', auth);
app.use('/board', board);
app.use((err, req, res, next) => {
    if (err && err.code === 'LIMIT_FILE_SIZE') {
        res.send({
            result: "fail",
            error: {
                code: 1001,
                message: 'File is too big'
            }
        });
    } 
});