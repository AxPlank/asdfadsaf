/**
 * Config
 */
const app = require('./config/express')();
const db = require('./config/mysql')();
const cron = require('node-cron');
const fs = require('fs');
const moment = require('./config/moment')();
const multer_board = require('./config/multer')();

/**
 * Router
 */
const table = require('./router/table')();
const auth = require('./router/auth')();
const board = require('./router/board')();

app.use('/table', table);
app.use('/auth', auth);
app.use('/board', board);

const task = cron.schedule('0 0 0 * * *', () => {
    fs.exists(`./boardmedia/${moment().format('YYYYMMDD')}`, (exists) => {
        if (exists) {
            console.log('exist');
        } else {
            fs.mkdir('./boardmedia/HELLO', () => {
                console.log('created');
            });
        }
    })
}, {
    scheduled: true,
    timezone: 'asia/seoul'
});

task.start();