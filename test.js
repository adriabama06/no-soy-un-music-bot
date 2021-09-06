const MysqlIntermediator = require('./mysql.js');

const Mysql = new MysqlIntermediator();

Mysql.add('23235234').then(async () => {
    const server = await Mysql.get('23235234');
    console.log('<! --- !>');
    console.log(server);
});