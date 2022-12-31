module.exports = () => {
    const cron = require('node-cron');

    const task = cron.schedule('*/5 * * * * *', () => {
        console.log(moment().format('YYYYMMDD'));
    }, {
        scheduled: false,
        timezone: 'asia/seoul'
    });

    return task;
}