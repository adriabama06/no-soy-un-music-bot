import { ConfigInterface } from './interfaces';
import { MinutesToMilliseconds } from './util';

var config: ConfigInterface = {
    discord: {
        token: "https://discord.com/developers/"
    },
    youtube: {
        token: "https://console.cloud.google.com/apis/dashboard"
    },
    database: 'quick.db',
    syncInterval: MinutesToMilliseconds(5),
    /*mysql: { // uncoment this if you select mysql
        user: "user",
        password: "shh secret",
        host: "someip",
        database: "music",
        tables: {
            safesearch: "safesearch",
            queues: "queues",
            info: "info"
        },
        maxQueueSize: 535 // Max size of the queue is 535 at mysql
    },*/
    default: {
        safesearch: "0", // 0 = none, 1 = moderate, 2 = strict
        language: "en" // set language what prefer, en or es, you can add more at the code
    }
};

export default config;