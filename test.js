const MysqlIntermediator = require('./mysql.js');

const Mysql = new MysqlIntermediator();

async function main() {
    console.log(Mysql.servers.keys());
    console.log(Mysql.get('23235234'));
    await Mysql.remove('23235234');
    console.log(Mysql.servers.keys());
    console.log(Mysql.has('23235234') ? Mysql.get('23235234') : Mysql.has('23235234'));
}

setTimeout(() => {
    main();
}, 5000);