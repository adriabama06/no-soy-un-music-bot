import ytdl from 'ytdl-core';

import { MysqlIntermediator } from './mysql';

export interface MysqlServerInterface {
    id(id: any, arg1: any);
    prefix: {id: string, prefix: string, user: string},
    safesearch: {id: string, safesearch: string, user: string},
    queues: {id: string, queue: ytdl.videoInfo[] | string, user: string},
    info: {id: string, user: string},
}

export interface ClientConfigInterface {
    SyncInterval: number,
    CallBack?: (MysqlIntermediator: MysqlIntermediator) => void,
    override?: boolean
}