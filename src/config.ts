import { ConfigInterface, LanguageType } from './interfaces';

var config: ConfigInterface = {
    discord: {
        token: "https://discord.com/developers/"
    },
    youtube: {
        token: "https://console.cloud.google.com/apis/dashboard"
    },
    mysql: {
        username: "user",
        password: "shh secret",
        host: "someip",
        database: "music", // this is example
        tables: {
            prefix: "prefix", // this is example
            safesearch: "safesearch", // this is example
            queues: "queues", // this is example
            info: "info" // this is example
        },
        maxQueueSize: 535 // Max size of the queue is 535 at mysql
    },
    default: {
        prefix: "!!", // if you use Discord Message support, this is the prefix
        safesearch: "0", // 0 = none, 1 = moderate, 2 = strict
        language: "en" // set language what prefer, en or es, you can add more at the code
    }
};

export default config;