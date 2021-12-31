import { ConfigInterface } from './interfaces';

var config: ConfigInterface = {
    discord: {
        token: "https://discord.com/developers/"
    },
    youtube: {
        token: "https://console.cloud.google.com/apis/dashboard"
    },
    database: 'quick.db',
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
        prefix: "!!", // if you use Discord Message support, this is the prefix
        safesearch: "0", // 0 = none, 1 = moderate, 2 = strict
        language: "en" // set language what prefer, en or es, you can add more at the code
    }
};

export default config;