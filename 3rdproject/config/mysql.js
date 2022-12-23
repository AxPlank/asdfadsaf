module.exports = () => {
    const mysql = require('mysql');
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'joongseok03@',
        port: 3306,
        database: 'thirdproject'
    });

    return db;
}