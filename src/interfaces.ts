import { ApplicationCommandOptionData, Client, CommandInteraction } from 'discord.js';
import { videoInfo } from 'ytdl-core';
import mysql from 'mysql';

import { DataBase, Servers } from './database';
import { ServerManager } from './servers';

export type LanguageType = 'es' | 'en';

export function isLanguageType(object: string): object is LanguageType {
    return object === 'es' || object === 'en';
}

export interface ConfigInterface {
    discord: {
        token: string
    },
    youtube: {
        token: string
    },
    database: 'mysql' | 'quick.db',
    mysql?: mysql.ConnectionConfig & {tables: MysqlTables, maxQueueSize: number}, // Max size of the queue is 535 at mysql
    default: {
        prefix: string,
        safesearch: '0' | '1' | '2',
        language: LanguageType
    }
}

export interface ServerManagerOptionsInterface {
    volume: number,
    loop: boolean,
    skip: boolean
}

export interface CommandRunInterface {
    client: Client,
    interaction: CommandInteraction,
    DataBase: DataBase,
    Servers: Map<string, ServerManager>,
    Commands: Map<string, CommandInterface>,
    Alias: Map<string, CommandInterface>,
    DataBaseServer: DataBaseInterface,
    music: ServerManager
}

export interface CommandInterface {
    name: string | undefined,
    info: {
        es: string | undefined,
        en: string | undefined
    } | undefined,
    longinfo: {
        es: string | undefined,
        en: string | undefined
    } | undefined,
    params: {
        es: ApplicationCommandOptionData[] | undefined,
        en: ApplicationCommandOptionData[] | undefined
    } | undefined,
    alias: string[] | undefined,
    run: (CommandRun: CommandRunInterface) => Promise<boolean | void> | void
}

export interface MysqlTables {
    info: string,
    queues: string,
    safesearch: string
}

export interface SafeSearch {
    id: string,
    safesearch: string,
    user: string
}
export interface Queues {
    id: string,
    queue: videoInfo[] | string,
    user: string
}
export interface Info {
    id: string,
    language: LanguageType,
    user: string
}

export interface DataBaseInterface {
    safesearch: SafeSearch,
    queues: Queues,
    info: Info
}

export interface DataBaseCheckInterface {
    SyncInterval: number,
    IntervalCallBack?: (Servers: Servers) => void,
    override?: boolean
}