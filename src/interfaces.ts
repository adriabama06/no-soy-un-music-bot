import { ApplicationCommandOptionData, Client, CommandInteraction } from 'discord.js';
import { videoInfo } from 'ytdl-core';
import { DataBase, Servers } from './database';

import { MysqlIntermediator } from './mysql';
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
    mysql: {
        username: string,
        password: string,
        host: string,
        database: string
        tables: {
            prefix: string,
            safesearch: string,
            queues: string
            info: string
        },
        maxQueueSize: number // Max size of the queue is 535 at mysql
    },
    default: {
        prefix: string,
        safesearch: '0' | '1' | '2',
        language: LanguageType
    }
}

export interface MysqlServerInterface {
    prefix: {id: string, prefix: string, user: string},
    safesearch: {id: string, safesearch: string, user: string},
    queues: {id: string, queue: videoInfo[] | string, user: string},
    info: {id: string, language: LanguageType, user: string},
}

export interface ClientConfigInterface {
    SyncInterval: number,
    IntervalCallBack?: (MysqlIntermediator: MysqlIntermediator) => void,
    override?: boolean
}

export interface ServerManagerOptionsInterface {
    volume: number,
    loop: boolean,
    skip: boolean
}

export interface CommandRunInterface<DataType> {
    client: Client,
    interaction: CommandInteraction,
    DataBase: DataBase<DataType>,
    Servers: Map<string, ServerManager>,
    Commands: Map<string, CommandInterface<DataType>>,
    Alias: Map<string, CommandInterface<DataType>>,
    DataBaseServer: DataBaseInterface,
    music: ServerManager
}

export interface CommandInterface<DataType> {
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
    run: (CommandRun: CommandRunInterface<DataType>) => Promise<boolean | void> | void
}

export interface SafeSearch {
    id: string,
    safesearch: string,
    user: string
}
export interface Queues {
    id: string,
    queue: videoInfo[] | string[] | string,
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

export interface DataBaseCheckInterface<Manager> {
    SyncInterval: number,
    IntervalCallBack?: (Servers: Servers) => void,
    override?: boolean
}