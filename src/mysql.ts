/**
 * @author adriabama06
 * @see https://github.com/adriabama06/no-soy-un-music-bot
 */

import mysql from 'mysql';
import ytdl from 'ytdl-core';

import config from './config.json';
import { MysqlServerInterface, ClientConfigInterface } from './interfaces';

export class MysqlIntermediator {
    protected servers = new Map<string, MysqlServerInterface>();
    protected connection: mysql.Connection;
    protected MysqlConfig: mysql.ConnectionConfig;
    protected ClientConfig: ClientConfigInterface;
    protected CheckInterval: NodeJS.Timer;
    constructor(MysqlConfig: mysql.ConnectionConfig, ClientConfig: ClientConfigInterface) {
        this.connection = mysql.createConnection(MysqlConfig);
        this.connection.connect();

        this.MysqlConfig = MysqlConfig;
        this.ClientConfig = ClientConfig;
        
        this.CheckInterval = setInterval(() => {
            if(ClientConfig.CallBack != undefined) {
                ClientConfig.CallBack(this);
                if(ClientConfig.override) {
                    return;
                }
            }
            this.MysqlSync(true);
        }, ClientConfig.SyncInterval);
    }
    public get(id: string): MysqlServerInterface | false {
        var server = this.servers.get(id);
        if(server) {
            return server;
        }
        return false;
    }
    public has(id: string): boolean {
        return this.servers.has(id);
    }
    public async remove(id: string): Promise<boolean> {
        if(!this.servers.has(id)) {
            return false;
        }

        var sqls: string[] = [
            `DELETE FROM ${config.mysql.tables.prefix} WHERE \`id\` = '${id}';`,
            `DELETE FROM ${config.mysql.tables.safesearch} WHERE \`id\` = '${id}';`,
            `DELETE FROM ${config.mysql.tables.info} WHERE \`id\` = '${id}';`,
            `DELETE FROM ${config.mysql.tables.queues} WHERE \`id\` = '${id}';`
        ];
        var results = [];
        for(const sql of sqls) {
            const result = await this.query(sql);
            results.push(result);
        }
        if(results.includes('error')) {
            return false;
        }
        this.servers.delete(id);
        return true;
    }
    public async MysqlSync(reload?: boolean): Promise<void> {
        const prefix = await this.query(`SELECT * FROM ${config.mysql.tables.prefix}`);
        if(typeof prefix === 'string' && (prefix === 'no servers found' || prefix === 'error')) {
            return;
        }
        const safesearch = await this.query(`SELECT * FROM ${config.mysql.tables.safesearch}`);
        const queues = await this.query(`SELECT * FROM ${config.mysql.tables.queues}`);
        const info = await this.query(`SELECT * FROM ${config.mysql.tables.info}`);
        const servers: any[] = [];
        for(var i = 0; i < prefix.length; i++) {
            servers.push({prefix: prefix[i], safesearch: safesearch[i], queues: queues[i], info: info[i]});
        }
        if(reload) {
            this.servers.clear();
        }
        for(var i = 0; i < prefix.length; i++) { 
            this.servers.set(prefix[i].id, servers[i]);
            await this.ParseQueue(prefix[i].id);
        }
        return;
    }
    public async ParseQueue(id: string): Promise<boolean> {
        var server = this.servers.get(id);
        if(server && typeof server.queues.queue === 'string' && server.queues.queue.length > 0) {
            var temptransform: string[] = JSON.parse(server.queues.queue);
            var queue: ytdl.videoInfo[] = [];
            for(const song of temptransform) {
                const video = await ytdl.getInfo(`https://www.youtube.com/watch?v=${song}`);
                queue.push(video);
            }
            server.queues.queue = queue;
            return true;
        }
        return false;
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