module.exports = () => {
    // 미디어 파일 저장용 폴더 생성 관련
    const cron = require('node-cron');
    const fs = require('node:fs/promises');
    const moment = require('./timezone')();

    // 프로그램이 실행되고 있으면, 매일 자정마다 폴더 생성.
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