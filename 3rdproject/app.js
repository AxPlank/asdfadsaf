/**
 * Config
 */
const db = require('./config/mysql')();
const app = require('./config/express')();

/**
 * Router
 */
const table = require('./router/table')();

app.use('/table', table);