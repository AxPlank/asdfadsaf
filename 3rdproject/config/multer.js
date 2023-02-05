module.exports = (router) => {
    const multer = require('multer');
    const moment = require('./timezone')();

    // 업로드용 패턴. 이미지, 미디어 파일에 존재하는 mimetype의 패턴을 파악하여 업로드 진행여부 결정
    const patternImage = /^(image)/;
    const patternVideo = /^(video)/;

    // 기능에 따른 업로드 세부 속성 결정
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