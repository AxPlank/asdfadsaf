module.exports = () => {
    const cron = require('node-cron');
    const fs = require('node:fs/promises');
    const moment = require('./timezone')();

    const task = cron.schedule('0 0 0 * * *', async () => {
        fs.access(`./media/board/${moment().format('YYYYMMDD')}`).then(() => {
            console.log("Folder exist");
        }).catch((reason) => {
            return fs.mkdir(`./media/board/${moment().format('YYYYMMDD')}`)
        }).then(() => {
            console.log("Folder is maden");
        });
    }, {
        scheduled: true,
        timezone: 'asia/seoul'
    });

    return task;
}