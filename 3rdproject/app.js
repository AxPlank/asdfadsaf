/**
 * Config
 */
const app = require('./config/express')();
const db = require('./config/mysql')();

/**
 * Router
 */
const table = require('./router/table')();
const auth = require('./router/auth')();
const board = require('./router/board')();

app.use('/table', table);
app.use('/auth', auth);
app.use('/board', board);