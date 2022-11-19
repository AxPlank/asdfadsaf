module.exports = () => {
    const cron = require('node-cron');
    const moment = require('moment');
    require('moment-timezone');
    
    moment.tz.setDefault('Asia/Seoul');

    const task = cron.schedule('*/5 * * * * *', () => {
        console.log(moment().format('YYYY MM DD HH mm ss'));
    }, {
        scheduled: false,
        timezone: 'asia/seoul'
    });

    return task;
}