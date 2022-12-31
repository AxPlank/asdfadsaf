module.exports = () => {
    const cron = require('node-cron');
    const fs = require('fs');
    const moment = require('./timezone')();

    const task = cron.schedule('0 0 0 * * *', () => {
        fs.mkdir(`./media/board/${moment().format('YYYYMMDD')}`, (err) => {
            if (err) {
                console.log(err);
                throw err;
            } else {
                console.log("folder is maden");
            }
        });
    }, {
        scheduled: true,
        timezone: 'asia/seoul'
    });

    return task;
}