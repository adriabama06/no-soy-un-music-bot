/**
 * @see https://github.com/adriabama06/no-soy-un-music-bot/blob/main/setup/music.sql
 */

import mysql from 'mysql';
import ytdl from 'ytdl-core';

import config from './config';
import { MysqlServerInterface, ClientConfigInterface, LanguageType } from './interfaces';

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
        
        this.MysqlSync();

        this.CheckInterval = setInterval(() => {
            if(ClientConfig.IntervalCallBack != undefined) {
                ClientConfig.IntervalCallBack(this);
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

    async setPrefix(id: string, prefix: string, user: string = '%false%'): Promise<MysqlServerInterface | false> {
        var server = this.get(id);
        if(!server) {
            return false;
        }
        server.prefix.prefix = prefix;
        server.prefix.user = user;
        await this.query(`UPDATE ${config.mysql.tables.prefix} SET \`prefix\`= '${prefix}', \`user\` = '${user}' WHERE \`id\` = '${id}'`);
        return server;
    }

    async setSafeSearch(id: string, safesearch: string, user: string = '%false%'): Promise<MysqlServerInterface | false> {
        var server = this.get(id);
        if(!server) {
            return false;
        }
        server.safesearch.safesearch = safesearch;
        server.queues.user = user;
        await this.query(`UPDATE ${config.mysql.tables.safesearch} SET \`safesearch\`= '${safesearch}', \`user\` = '${user}' WHERE \`id\` = '${id}'`);
        return server;
    }

    /**
     * @param {string[]} queue 
     * Please give and string array **only** with VideoId : youtube.com/watch?v=**VIDEOID**
     */
    async setQueue(id: string, queue: string[], user: string = '%false%'): Promise<MysqlServerInterface | false> {
        var server = this.get(id);
        if(!server) {
            return false;
        }
        server.queues.queue = JSON.stringify(queue);
        server.queues.user = user;
        await this.query(`UPDATE ${config.mysql.tables.queues} SET \`queue\` = '${JSON.stringify(queue)}', \`user\` = '${user}' WHERE \`id\` = '${id}'`);
        this.ParseQueue(id);
        return server;
    }

    async setInfo(id: string, language: LanguageType, user: string): Promise<MysqlServerInterface | false> {
        var server = this.get(id);
        if(!server) {
            return false;
        }
        server.info.user = user;
        server.info.language = language;
        await this.query(`UPDATE ${config.mysql.tables.info} SET \`language\` = '${language}', \`user\` = '${user}' WHERE \`id\` = '${id}'`);
        return server;
    }
    public async add(id: string, user: string = '%false%'): Promise<boolean> {
        if(this.has(id)) {
            return false;
        }
        var sqls: string[] = [
            `INSERT INTO ${config.mysql.tables.prefix} (\`id\`, \`prefix\`, \`user\`) VALUES ('${id}', '${config.default.prefix}', '${user}');`,
            `INSERT INTO ${config.mysql.tables.safesearch} (\`id\`, \`safesearch\`, \`user\`) VALUES ('${id}', '${config.default.safesearch}', '${user}');`,
            `INSERT INTO ${config.mysql.tables.info} (\`id\`, \`language\`, \`user\`) VALUES ('${id}', '${config.default.language}', '${user}');`,
            `INSERT INTO ${config.mysql.tables.queues} (\`id\`, \`queue\`, \`user\`) VALUES ('${id}', '${JSON.stringify([])}', '${user}');`
        ];
        var results = [];
        for(const sql of sqls) {
            const result = await this.query(sql);
            results.push(result);
        }
        if(results.includes('error')) {
            return false;
        }
        this.servers.set(id, {
            prefix: { id: id, prefix: config.default.prefix, user: user },
            safesearch: { id: id, safesearch: config.default.safesearch, user: user },
            queues: { id: id, queue: [], user: user },
            info: { id: id, language: config.default.language, user: user }
        });
        return true;
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
    public async UnParseQueue(songs: ytdl.videoInfo[], max: number = config.mysql.maxQueueSize): Promise<string[]> {
        var parsed: string[] = [];
        for(var i = 0; i < songs.length; i++) {
            parsed.push(songs[i].videoDetails.videoId);
        }
        if(JSON.stringify(parsed).length > max) {
            while(JSON.stringify(parsed).length > max) {
                parsed.pop();
            }
        }
        return parsed;
    }
    public isMysqlServer(server: any): server is MysqlServerInterface {
        return server.prefix && server.safesearch && server.queues && server.info;
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