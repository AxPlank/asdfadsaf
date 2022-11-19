/**
 * multer
 */
// const multerhandler = require('./router/multer')();

/**
 * moment
 */
// const momenthandler = require('./router/moment')();

// console.log(momenthandler());

/**
 * cron
 */
const task = require('./router/node_cron')();

task.start();