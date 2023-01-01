module.exports = (router) => {
    const multer = require('multer');
    const moment = require('./timezone')();

    const patternImage = /^(image)/;
    const patternVideo = /^(video)/;

    switch (router) {
        case 'board':
            const limits ={
                fields: 3,
                files: 12,
                fileSize: 10485760,
                parts: 15,
            };

            const fileFilter = (req, file, cb) => {
                if (file.mimetype.match(patternImage) || file.mimetype.match(patternVideo)) {
                    cb(null, true);
                } else {
                    cb({msg: 'You can upload video or image'}, false);
                }
            }

            const Upload = multer({
                dest: `./media/board/${moment().format('YYYYMMDD')}`,
                limits: limits,
                fileFilter: fileFilter
            });

            return Upload;
    }
}