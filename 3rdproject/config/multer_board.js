module.exports = () => {
    const multer = require('multer');
    const moment = require('./moment')();

    const ImagefileFilter = (req, file, cb) => {
        if (file.mimetype.match(/^(image)/)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    };
    const VideofileFilter = (req, file, cb) => {
        if (file.mimetype.match(/^(video)/)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    };
    const Imagelimits = {
        fields: 0,
        fileSize: 10000000,
        files: 10,
    };
    const Videolimits = {
        fields: 0,
        fileSize: 100000000,
        files: 2,
    };;

    const ImageUpload = multer({
        dest: `./boardmedia/${moment().format('YYYYMMDD')}`,
        fileFilter: ImagefileFilter,
        limits: Imagelimits
    }).array('image', 10);

    const VideoUpload = multer({
        dest: `./boardmedia/${moment().format('YYYYMMDD')}`,
        fileFilter: VideofileFilter,
        limits: Videolimits
    }).array('video', 2);

    return [ImageUpload, VideoUpload];
}