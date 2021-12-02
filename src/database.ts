/**
 * @see https://github.com/adriabama06/no-soy-un-music-bot/blob/main/setup/music.sql
 */
import mysql from 'mysql';
import ytdl from 'ytdl-core';

import config from './config';
import { ParseQueue } from './util'
import { ClientConfigInterface, DataBaseCheckInterface, DataBaseInterface } from "./interfaces";

type Servers = Map<string, DataBaseInterface>;

export class MySql {
    protected servers: Servers = new Map();
    protected connection: mysql.Connection;
    protected MysqlConfig: mysql.ConnectionConfig;
    protected Check: DataBaseCheckInterface<MySql>;
    protected CheckInterval: NodeJS.Timer;
    constructor(MysqlConfig: mysql.ConnectionConfig, Check: DataBaseCheckInterface<MySql>) {
        this.connection = mysql.createConnection(MysqlConfig);
        this.connection.connect();

        this.MysqlConfig = MysqlConfig;
        this.Check = Check;

        this.MysqlSync();

        this.CheckInterval = setInterval(() => {
            if(Check.IntervalCallBack != undefined) {
                Check.IntervalCallBack(this);
                if(Check.override) {
                    return;
                }
            }
            this.MysqlSync(true);
        }, Check.SyncInterval);
    }
    public has(id: string): boolean {
        return this.servers.has(id);
    }
    public get(id: string): DataBaseInterface | undefined {
        var server = this.servers.get(id);
        if(server) {
            return server;
        }
        return undefined;
    }
    public async MysqlSync(reload?: boolean): Promise<void> {
        const info = await this.query(`SELECT * FROM ${config.mysql.tables.info}`);
        if(typeof info === 'string' && (info === 'no servers found' || info === 'error')) {
            return;
        }
        const safesearch = await this.query(`SELECT * FROM ${config.mysql.tables.safesearch}`);
        const queues = await this.query(`SELECT * FROM ${config.mysql.tables.queues}`);
        const servers: any[] = [];
        for(var i = 0; i < info.length; i++) {
            servers.push({safesearch: safesearch[i], queues: queues[i], info: info[i]});
        }
        if(reload) {
            this.servers.clear();
        }
        for(var i = 0; i < info.length; i++) {
            var queue = await ParseQueue(servers[i].queues.queue);
            servers[i].queues.queue = queue;
            this.servers.set(info[i].id, servers[i]);
        }
        return;
    }
    protected async query(sql: string): Promise<any[] | 'error' | 'no servers found'> {
        return new Promise(async (resolve) => {
            this.connection.query(sql, async (error, results, fields) => {
                if(error) {
                    console.log(error);
                    console.log('DevResults:');
                    console.log(results);
                    resolve('error');
                }
                if(!results || results.length === 0) {
                    console.log('mysql no encontro ningun servidor en la base de datos, prueba de invitar al bot a algun servidor o ejecutar algun comando');
                    resolve('no servers found');
                }
                resolve(results);
            });
        });
    }
}