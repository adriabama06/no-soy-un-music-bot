/**
 * @author adriabama06
 * @see https://github.com/adriabama06/no-soy-un-music-bot
 */

import mysql from 'mysql';
import ytdl from 'ytdl-core';

interface MysqlServersInterface {
    prefix: {id: string, prefix: string, user: string},
    safesearch: {id: string, safesearch: string, user: string},
    queues: {id: string, queue: ytdl.videoInfo[] | string, user: string},
    info: {id: string, user: string},
}

interface MysqlIntermediatorInterface {
    
}
class MysqlIntermediator implements MysqlIntermediatorInterface {
    protected servers = new Map<string, MysqlServersInterface>();
    protected connection: any;
    constructor(config: {host: string, user: string, password: string, database: string}) {
        this.connection = mysql.createConnection(config);
        this.connection.connect();
    }
}