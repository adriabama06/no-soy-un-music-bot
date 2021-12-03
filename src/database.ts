/**
 * @see https://github.com/adriabama06/no-soy-un-music-bot/blob/main/setup/music.sql
 */
import mysql from 'mysql';
import ytdl from 'ytdl-core';

import config from './config';
import { ParseQueue } from './util'
import { ClientConfigInterface, DataBaseCheckInterface, DataBaseInterface } from "./interfaces";

export type Servers = Map<string, DataBaseInterface>;

class DataBase<DataBaseType> {
    protected servers: Servers = new Map();
    protected Check: DataBaseCheckInterface<DataBaseType>;
    protected CheckInterval: NodeJS.Timer;
    constructor(Check: DataBaseCheckInterface<DataBaseType>) {
        this.Check = Check;

        this.Sync();

        this.CheckInterval = setInterval(() => {
            if(Check.IntervalCallBack != undefined) {
                Check.IntervalCallBack(this.servers);
                if(Check.override) {
                    return;
                }
            }
            this.Sync(true);
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
    protected async Sync(reload?: boolean): Promise<void> {};
}

export class MySql extends DataBase<MySql> {
    protected connection: mysql.Connection;
    protected Config: mysql.ConnectionConfig;
    constructor(Config: mysql.ConnectionConfig, Check: DataBaseCheckInterface<MySql>) {
        var c = mysql.createConnection(Config);
        c.connect();
        super(Check);

        this.connection = c;

        this.Config = Config;
    }
    protected async Sync(reload?: boolean): Promise<void> {
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

export class QuickDB extends DataBase<QuickDB> {
    
}