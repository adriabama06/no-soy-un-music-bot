const mysql = require('mysql');
const config = require('./config.json');
class MysqlDriver {
    constructor() {
        this.servers = new Map();
        this.connection = mysql.createConnection({
            host: config.mysql.host,
            user: config.mysql.username,
            password: config.mysql.password,
            database: config.mysql.database,
            //connectTimeout: 2,
        });
    }
}