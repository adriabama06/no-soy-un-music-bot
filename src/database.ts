/**
 * @see https://github.com/adriabama06/no-soy-un-music-bot/blob/main/setup/music.sql
 */
import mysql from 'mysql';

import quickdb from 'quick.db';

import config from './config';
import { ParseQueue } from './util'
import { DataBaseCheckInterface, DataBaseInterface, Info, MysqlTables, Queues, SafeSearch } from "./interfaces";

export type Servers = Map<string, DataBaseInterface>;

export class DataBase {
    protected servers: Servers = new Map();
    protected Check: DataBaseCheckInterface;
    protected CheckInterval: NodeJS.Timer;
    constructor(Check: DataBaseCheckInterface) {
        this.Check = Check;

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
    public async setInfo(data: Info): Promise<boolean> {return false;};
    public async setQueues(data: Queues): Promise<boolean> {return false;};
    public async setSafeSearch(data: SafeSearch): Promise<boolean> {return false;};
    public async add(id: string, user: string = '%false%'): Promise<boolean> {return false;};
    public async delete(id: string): Promise<boolean> {return false;};
    protected async Sync(reload?: boolean): Promise<void> {};
}

export class MySql extends DataBase {
    protected connection: mysql.Connection;
    protected Config: mysql.ConnectionConfig;
    protected Tables: MysqlTables;
    public maxQueueSize: number;
    constructor(Config: mysql.ConnectionConfig & {tables: MysqlTables, maxQueueSize: number}, Check: DataBaseCheckInterface) {
        super(Check);

        this.maxQueueSize = Config.maxQueueSize;
        this.Tables = Config.tables;

        this.connection = mysql.createConnection(Config);
        this.connection.connect();

        this.Sync();

        this.Config = Config;
    }
    public async setInfo(data: Info): Promise<boolean> {
        var server = this.servers.get(data.id);
        if(!server) {
            return false;
        }
        var status = await this.SqlUpdate(this.Tables.info, `\`language\` = '${data.language}', \`user\` = '${data.user}'`, `\`id\` = '${data.id}'`);
        if(status == undefined) {
            return false;
        }
        server.info = data;
        return true;
    }
    public async setQueues(data: Queues): Promise<boolean> {
        var server = this.servers.get(data.id);
        if(!server) {
            return false;
        }
        var status = await this.SqlUpdate(this.Tables.queues, `\`queue\` = '${data.queue}', \`user\` = '${data.user}'`, `\`id\` = '${data.id}'`);
        if(status == undefined) {
            return false;
        }
        server.queues = data;
        return true;
    }
    public async setSafeSearch(data: SafeSearch): Promise<boolean> {
        var server = this.servers.get(data.id);
        if(!server) {
            return false;
        }
        var status = await this.SqlUpdate(this.Tables.safesearch, `\`safesearch\` = '${data.safesearch}', \`user\` = '${data.user}'`, `\`id\` = '${data.id}'`);
        if(status == undefined) {
            return false;
        }
        server.safesearch = data;
        return true;
    }
    public async add(id: string, user: string = '%false%'): Promise<boolean> {
        if(this.has(id)) {
            return false;
        }
        var info = await this.SqlInsert(this.Tables.info, '`id`, `language`, `user`', `'${id}', '${config.default.language}', '${user}'`);
        if(info == undefined) {
            return false;
        }
        var queues = await this.SqlInsert(this.Tables.queues, '`id`, `queue`, `user`', `'${id}', '${JSON.stringify([])}', '${user}'`);
        if(queues == undefined) {
            return false;
        }
        var safesearch = await this.SqlInsert(this.Tables.safesearch, '`id`, `safesearch`, `user`', `'${id}', '${config.default.safesearch}', '${user}'`);
        if(safesearch == undefined) {
            return false;
        }
        this.servers.set(id, {
            info: {
                id: id,
                language: config.default.language,
                user: user
            },
            queues: {
                id: id,
                queue: [],
                user: user
            },
            safesearch: {
                id: id,
                safesearch: config.default.safesearch,
                user: user
            }
        });
        return true;
    }
    public async delete(id: string): Promise<boolean> {
        if(!this.has(id)) {
            return false;
        }
        var info = await this.SqlDelete(this.Tables.info, `\`id\` = '${id}'`);
        if(info == undefined) {
            return false;
        }
        var queues = await this.SqlDelete(this.Tables.queues, `\`id\` = '${id}'`);
        if(queues == undefined) {
            return false;
        }
        var safesearch = await this.SqlDelete(this.Tables.safesearch, `\`id\` = '${id}'`);
        if(safesearch == undefined) {
            return false;
        }
        this.servers.delete(id);
        return true;
    }
    protected async Sync(reload?: boolean): Promise<void> {
        const info = await this.SqlSelect(this.Tables.info);
        if(!info) {
            return;
        }
        const safesearch = await this.SqlSelect(this.Tables.safesearch);
        if(!safesearch) {
            return;
        }
        const queues = await this.SqlSelect(this.Tables.queues);
        if(!queues) {
            return;
        }
        const servers: any[] = [];
        for(var i = 0; i < info.length; i++) {
            servers.push({
                safesearch: safesearch[i],
                queues: queues[i],
                info: info[i]
            });
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
    protected SqlSelect(table: string) {
        return this.query(`SELECT * FROM ${table};`);
    }
    protected SqlInsert(table: string, options: string, data: string) {
        return this.query(`INSERT INTO ${table} (${options}) VALUES (${data});`);
    }
    protected SqlUpdate(table: string, toset: string, where: string) {
        return this.query(`UPDATE ${table} SET ${toset} WHERE ${where};`);
    }
    protected SqlDelete(table: string, where: string) {
        return this.query(`DELETE FROM ${table} WHERE ${where};`);
    }
    protected async query(sql: string): Promise<any[] | undefined> {
        return new Promise(async (resolve) => {
            this.connection.query(sql, async (error, results, fields) => {
                if(error) {
                    console.log(error);
                    console.log('DevResults:');
                    console.log(results);
                    resolve(undefined);
                }
                if(!results || results.length === 0) {
                    console.log('mysql no encontro ningun servidor en la base de datos, prueba de invitar al bot a algun servidor o ejecutar algun comando');
                    resolve(undefined);
                }
                resolve(results);
            });
        });
    }
}

export class QuickDB extends DataBase {
    constructor(Config: DataBaseCheckInterface) {
        super(Config);
        
        this.Sync();
    }
    public async setInfo(data: Info): Promise<boolean> {
        var server = this.servers.get(data.id);
        if(!server) {
            return false;
        }
        server.info = data;
        quickdb.set(data.id, JSON.stringify(server));
        return true;
    }
    public async setQueues(data: Queues): Promise<boolean> {
        var server = this.servers.get(data.id);
        if(!server) {
            return false;
        }
        server.queues = data;
        quickdb.set(data.id, JSON.stringify(server));
        return true;
    }
    public async setSafesearch(data: SafeSearch): Promise<boolean> {
        var server = this.servers.get(data.id);
        if(!server) {
            return false;
        }
        server.safesearch = data;
        quickdb.set(data.id, JSON.stringify(server));
        return true;
    }
    public async add(id: string, user: string = '%false%'): Promise<boolean> {
        if(this.has(id)) {
            return false;
        }
        var s: DataBaseInterface = {
            info: {
                id: id,
                language: config.default.language,
                user: user
            },
            queues: {
                id: id,
                queue: [],
                user: user
            },
            safesearch: {
                id: id,
                safesearch: config.default.safesearch,
                user: user
            }
        };
        this.servers.set(id, s);
        quickdb.set(id, JSON.stringify(s));
        return true;
    }
    public async delete(id: string): Promise<boolean> {
        if(!this.has(id)) {
            return false;
        }
        quickdb.delete(id);
        return true;
    }
    protected async Sync(reload?: boolean): Promise<void> {
        if(reload) {
            this.servers.clear();
        }
        for(const { ID, data } of quickdb.all()) {
            var server = JSON.parse(data);
            console.log(server);
            console.log(server.queues);
            var queue = server.queues.queue;
            if(typeof queue === 'string') {
                queue = await ParseQueue(queue);
            }
            server.queues.queue = queue;
            this.servers.set(server.info.id, server);
        }
        return;
    }
}