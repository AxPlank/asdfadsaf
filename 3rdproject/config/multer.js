module.exports = (router) => {
    const multer = require('multer');
    const moment = require('./timezone')();

    switch (router) {
        case 'board':
            const boardUpload = multer({
                dest: `./media/board/${moment().format('YYYYMMDD')};`,
            });

            return boardUpload;
    }
}