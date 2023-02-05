module.exports = () => {
    // 미디어 파일 저장일자 관련. 전부 한국 시간으로 통합
    const moment = require('moment');
    require('moment-timezone');

    moment.tz.setDefault("Asia/Seoul");

    return moment;
}