const mysql = require('mysql');
const config = require('./config.json');
const ytdl = require('ytdl-core');

class MysqlIntermediator {
    /**
     * @param {number} kepaliveinterval
     * @param {'seconds' | 'minutes' | 'hours'} time
     */
    constructor(kepaliveinterval = 30, time = 'minutes') {
        /**
         * @protected
         * @type {Map<string, {
         * prefix: {id: string, prefix: string, user: string},
         * safesearch: {id: string, safesearch: string, user: string},
         * queues: {id: string, queue: ytdl.videoInfo[] | string, user: string},
         * info: {id: string, user: string},
         * }
         * >}
         */
        this.servers = new Map();
        /**
         * @protected
         */
        this.connection = mysql.createConnection({
            host: config.mysql.host,
            user: config.mysql.username,
            password: config.mysql.password,
            database: config.mysql.database,
            //connectTimeout: 2, // Pon timeout para el intento de conectarse
        });

        /**
         * @type {number}
         */
        this.timeinterval = 30 * 1000 * 60;

        this.connection.connect();
        this.loadServers();
        if(time.toLowerCase() === 'seconds') {
            this.timeinterval = kepaliveinterval * 1000;
        }
        if(time.toLowerCase() === 'minutes') {
            this.timeinterval = kepaliveinterval * 1000 * 60;
        }
        if(time.toLowerCase() === 'hours') {
            this.timeinterval = kepaliveinterval * 1000 * 60 * 60;
        }
        /**
         * @protected
         */
        this.interval = setInterval(() => {
            this.query(`SELECT * FROM \`${config.mysql.tables.prefix}\``);
        }, this.timeinterval);
    }

    /**
     * @param {string} id
     */
    get(id) {
        return this.servers.get(id);
    }

    /**
     * @param {string} id
     * @returns {boolean}
     */
    has(id) {
        return this.servers.has(id);
    }

    /**
     * @param {string} id
     * @param {string} prefix
     * @param {string} user
     */
    async setPrefix(id, prefix, user = '%false%') {
        const server = this.servers.get(id);
        server.prefix.prefix = prefix;
        server.prefix.user = user;
        await this.query(`UPDATE ${config.mysql.tables.prefix} SET \`prefix\`= '${prefix}', \`user\` = '${user}' WHERE \`id\` = '${id}'`);
        return server;
    }

    /**
     * @param {string} id
     * @param {string} safesearch
     * @param {string} user
     */
    async setSafeSearch(id, safesearch, user = '%false%') {
        const server = this.servers.get(id);
        server.safesearch.safesearch = safesearch;
        server.queues.user = user;
        await this.query(`UPDATE ${config.mysql.tables.safesearch} SET \`safesearch\`= '${safesearch}', \`user\` = '${user}' WHERE \`id\` = '${id}'`);
        return server;
    }

    /**
     * @param {string} id
     * @param {string[]} queue 
     * Please give and string array **only** with VideoId : youtube.com/watch?v=**VIDEOID**
     * @param {string} user
     */
    async setQueue(id, queue, user = '%false%') {
        const server = this.servers.get(id);
        server.queues.queue = queue;
        server.queues.user = user;
        await this.query(`UPDATE ${config.mysql.tables.queues} SET \`queue\` = '${JSON.stringify(queue)}', \`user\` = '${user}' WHERE \`id\` = '${id}'`);
        return server;
    }

    /**
     * @param {string} id
     * @param {string} user 
     * Please give and string array **only** with VideoId https://youtube.com/watch?v=**VIDEOID**
     */
    async setInfo(id, user) {
        const server = this.servers.get(id);
        server.info.user = user;
        await this.query(`UPDATE ${config.mysql.tables.info} SET \`user\` = '${user}' WHERE \`id\` = '${id}'`);
        return server;
    }

    /**
     * @returns {Promise<true> | false}
     * @param {string} id
     * @param {string} user
     */
    async add(id, user = '%false%') {
        if(this.servers.has(id)) {
            return false;
        }

        var sqls = [
            `INSERT INTO ${config.mysql.tables.prefix} (\`id\`, \`prefix\`, \`user\`) VALUES ('${id}', '${config.discord.defaultprefix}', '${user}');`,
            `INSERT INTO ${config.mysql.tables.safesearch} (\`id\`, \`safesearch\`, \`user\`) VALUES ('${id}', '${config.youtube.defaultsafesearch}', '${user}');`,
            `INSERT INTO ${config.mysql.tables.info} (\`id\`, \`user\`) VALUES ('${id}', '${user}');`,
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
            prefix: { id: id, prefix: config.discord.defaultprefix, user: user },
            safesearch: { id: id, safesearch: config.youtube.defaultsafesearch, user: user },
            queues: { id: id, queue: [], user: user },
            info: { id: id, user: user }
        });
        return true;
    }

    /**
     * @returns {Promise<true> | false}
     * @param {string} id
     */
    async remove(id) {
        if(!this.servers.has(id)) {
            return false;
        }

        var sqls = [
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

    async loadServers() {
        const prefix = await this.query(`SELECT * FROM ${config.mysql.tables.prefix}`);
        if(typeof prefix === 'string' && prefix === 'no-servers') {
            return;
        }
        const safesearch = await this.query(`SELECT * FROM ${config.mysql.tables.safesearch}`);
        const queues = await this.query(`SELECT * FROM ${config.mysql.tables.queues}`);
        const info = await this.query(`SELECT * FROM ${config.mysql.tables.info}`);
        const servers = [];
        for(var i = 0; i < prefix.length; i++) {
            servers.push({prefix: prefix[i], safesearch: safesearch[i], queues: queues[i], info: info[i]});
        }
        for(var i = 0; i < prefix.length; i++) { 
            this.servers.set(prefix[i].id, servers[i]);
            await this.parsequeue(prefix[i].id);
        }
        return;
    }

    /**
     * @description 
     * `
     * Why i don't use this.servers.clear() and afther execute this.loadServers() ? if you run in clear -> loadServers from clear to loadServers have 0.??? seconds because need do request and what ? someone can write or add the bot at this exact moment and make problems`
     */
    async reloadServers() {
        const prefix = await this.query(`SELECT * FROM ${config.mysql.tables.prefix}`);
        if(typeof prefix === 'string' && prefix === 'no-servers') {
            return;
        }
        const safesearch = await this.query(`SELECT * FROM ${config.mysql.tables.safesearch}`);
        const queues = await this.query(`SELECT * FROM ${config.mysql.tables.queues}`);
        const info = await this.query(`SELECT * FROM ${config.mysql.tables.info}`);
        const servers = [];
        for(var i = 0; i < prefix.length; i++) {
            servers.push({prefix: prefix[i], safesearch: safesearch[i], queues: queues[i], info: info[i]});
        }
        this.servers.clear();
        for(var i = 0; i < prefix.length; i++) { 
            this.servers.set(prefix[i].id, servers[i]);
            await this.parsequeue(prefix[i].id);
        }
        return;
    }

    /**
     * @param {string} id
     * @returns {Promise<true> | false}
     */
    async parsequeue(id) {
        var server = this.servers.get(id);
        if(typeof server.queues.queue === 'string' && !typeof server.queues.queue.length <= 0) {
            var temptransform = JSON.parse(server.queues.queue);
            var queue = [];
            for(const song of temptransform) {
                const video = await ytdl.getInfo(`https://www.youtube.com/watch?v=${song}`);
                queue.push(video);
            }
            server.queues.queue = queue;
            return true;
        }
        return false;
    }

    /**
     * @param {string} sql
     * @returns {Promise<{}[]>}
     */
     async query(sql) {
        return new Promise(async (resolve, reject) => {
            this.connection.query(sql, async (error, results, fields) => {
                if(error) {
                    console.log(error);
                    console.log("DevResults:");
                    console.log(results);
                    resolve("error");
                }
                if(!results || results.length === 0) {
                    console.log("mysql no encontro ningun servidor");
                    resolve("no-servers");
                }
                resolve(results);
            });
        });
    }
}

module.exports = MysqlIntermediator