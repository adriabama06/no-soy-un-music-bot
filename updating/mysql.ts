/**
 * @author adriabama06
 * @see https://github.com/adriabama06/no-soy-un-music-bot
 */

import mysql from 'mysql';
import ytdl from 'ytdl-core';
import { MysqlIntermediatorInterface, MysqlServersInterface } from './interfaces';

export class MysqlIntermediator implements MysqlIntermediatorInterface {
    protected servers = new Map<string, MysqlServersInterface>();
    protected connection: any;
    constructor(config: {host: string, user: string, password: string, database: string}) {
        this.connection = mysql.createConnection(config);
        this.connection.connect();
    }
}