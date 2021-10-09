import { ApplicationCommandOptionData, Client, Interaction } from 'discord.js';
import { videoInfo } from 'ytdl-core';

import { MysqlIntermediator } from './mysql';

export interface MysqlServerInterface {
    prefix: {id: string, prefix: string, user: string},
    safesearch: {id: string, safesearch: string, user: string},
    queues: {id: string, queue: videoInfo[] | string, user: string},
    info: {id: string, user: string},
}

export interface ClientConfigInterface {
    SyncInterval: number,
    CallBack?: (MysqlIntermediator: MysqlIntermediator) => void,
    override?: boolean
}

export interface CommandRunInterface {
    client: Client,
    interaction: Interaction,
    Mysql: MysqlIntermediator,
    Servers: any,
    Commands: CommandInterface,
    Alias: CommandInterface
}

export interface CommandInterface {
    name: string,
    info: {
        es: string,
        en: string
    }
    longinfo: {
        es: string,
        en: string
    }
    params: ApplicationCommandOptionData,
    alias: string[],
    run: (CommandRun: CommandRunInterface) => Promise<boolean>
}