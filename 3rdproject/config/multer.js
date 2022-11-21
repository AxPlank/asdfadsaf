module.exports = (upload) => {
    const multer = require('multer');
    const moment = require('./moment')();

    const boardfileFilter = (req, file, cb) => {
        if (file.mimetype.match(/^(image)/) || file.mimetype.match(/^(video)/)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    };
    const boardlimits = {
        fields: 3,
        fileSize: 100000000,
        files: 13,
    };

    const boardUpload = multer({
        dest: `./boardmedia/${moment().format('YYYYMMDD')}`,
        fileFilter: boardfileFilter,
        limits: boardlimits
    }).fields([
        { name: 'image', maxCount: 10 },
        { name: 'video', maxCount: 2 }
    ]);

    switch (upload) {
        case 'boardUpload':
            return boardUpload;
    }
}