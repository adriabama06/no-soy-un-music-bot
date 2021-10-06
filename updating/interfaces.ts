import ytdl from 'ytdl-core';

export interface MysqlServersInterface {
    prefix: {id: string, prefix: string, user: string},
    safesearch: {id: string, safesearch: string, user: string},
    queues: {id: string, queue: ytdl.videoInfo[] | string, user: string},
    info: {id: string, user: string},
}

export interface MysqlIntermediatorInterface {
    
}