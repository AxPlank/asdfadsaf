module.exports = () => {
    const db = require('mysql').createConnection({
        host: 'localhost',
        user: 'root',
        password: 'joongseok03@',
        port: 3306,
        database: 'thirdproject'
    });

    return db;
}