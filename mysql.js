const mysql = require('mysql');
const config = require('./config.json');
class MysqlIntermediator {
    constructor() {
        /**
         * @protected
         * @type {Map<string, {id: string, prefix: string, safesearch: number}>}
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

        this.connection.connect();
        this.loadServers();
    }
    /**
     * @param {string} id 
     * @returns {{id: string, prefix: string, safesearch: number}}
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
     * @returns {Promise<boolean>}
     */
    async add(id) {
        if(this.servers.has(id)) {
            return false;
        }

        const results = await this.query(`INSERT INTO ${config.mysql.table} (\`id\`, \`prefix\`, \`safesearch\`) VALUES ('${id}', '${config.discord.defaultprefix}', '${config.youtube.defaultsafesearch}')`);
        if(typeof results === 'string' && results === 'error') {
            return false;
        }
        this.servers.set(id, { id: id, prefix: config.discord.defaultprefix, safesearch: config.youtube.defaultsafesearch });
        console.log({ id: id, prefix: config.discord.defaultprefix, safesearch: config.youtube.defaultsafesearch });
        return true;
    }

    /**
     * @param {string} id 
     * @param {string} prefix
     * @returns {Promise<{id: string, prefix: string, safesearch: number}>}
     */
    async setPrefix(id, prefix) {
        const server = this.get(id);
        server.prefix = prefix;
        await this.query(`UPDATE ${config.mysql.table} SET \`prefix\`= '${prefix}' WHERE \`id\` = '${id}'`);
        return server;
    }
    /**
     * @param {string} id 
     * @param {number} safesearch
     * @returns {Promise<{id: string, prefix: string, safesearch: number}>}
     */
    async setSafeSearch(id, safesearch) {
        const server = this.get(id);
        server.safesearch = safesearch;
        await this.query(`UPDATE ${config.mysql.table} SET \`safesearch\`= '${safesearch}' WHERE \`id\` = '${id}'`);
        return server;
    }

    async loadServers() {
        const results = await this.query(`SELECT * FROM ${config.mysql.table}`);
        for(const result of results) { 
            this.servers.set(result.id, result);
            console.log(this.servers.get(result.id))
        }
        return;
    }
    async reloadServers() {
        this.servers.clear();
        await this.loadServers();
        return;
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

module.exports = MysqlIntermediator;