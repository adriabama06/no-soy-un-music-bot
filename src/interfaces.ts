import { ApplicationCommandOptionData, Client, CommandInteraction } from 'discord.js';
import { videoInfo } from 'ytdl-core';

import { MysqlIntermediator } from './mysql';
import { ServerManager } from './servers';

export type LanguageType = 'es' | 'en';

export function isLanguageType(object: string): object is LanguageType {
    return object === 'es' || object === 'en';
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

export interface CommandRunInterface {
    client: Client,
    interaction: CommandInteraction,
    Mysql: MysqlIntermediator,
    Servers: Map<string, ServerManager>,
    Commands: Map<string, CommandInterface>,
    Alias: Map<string, CommandInterface>,
    server: MysqlServerInterface,
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