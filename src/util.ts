import { Message, MessageActionRow, MessageButton } from 'discord.js';
import ytdl, { videoInfo } from 'ytdl-core';
import config from './config';

export async function messageDelete(message: Message, userid?: string, timeout: number = 240000): Promise<boolean> {
    return new Promise(async (resolve) => {
        const row = new MessageActionRow().addComponents(
            new MessageButton()
            .setCustomId('delete')
            .setEmoji('❌')
            .setStyle('SECONDARY'));
        await message.edit({components: [row]});
        
        // sorry i can't find the class for i (interaction i know)
        const filter = (i: any) => i.customId === 'delete' && (userid ? i.user.id === userid : true);

        const collector = message.createMessageComponentCollector({ filter, time: timeout });

        // sorry i can't find the class for i (interaction i know)
        collector.on('collect', async (i) => {
            if (i.customId === 'delete') {
                await i.deferUpdate();
                collector.stop('user');
            }
        });
        
        collector.on('end', async (collected, reason) => {
            if(message.deleted == false && message.deletable == true && typeof message.delete == 'function') {
                await message.delete();
            }
            if(reason && reason === 'user') {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

export function MilisecondsToTime(time: number): string {
   return new Date(time).toISOString().substring(11, 8); // .substr() despracated, changed to .substring()
}

export async function sleep(TimeInMs: number): Promise<number> {
    return new Promise(resolve => setTimeout(() => resolve(TimeInMs), TimeInMs));
}

export async function ParseQueue(queue: string): Promise<videoInfo[]> {
    var temptransform: string[] = JSON.parse(queue);
    var toreturn: videoInfo[] = [];
    for(const song of temptransform) {
        await sleep(250); // add delay to prevent ratelimit
        const video = await ytdl.getInfo(`https://www.youtube.com/watch?v=${song}`);
        toreturn.push(video);
    }
    return toreturn;
}
export async function UnParseQueue(songs: ytdl.videoInfo[]): Promise<string[]> {
    var maxStrLen: number = 535;
    if(config.mysql) {
        maxStrLen = config.mysql.maxQueueSize;
    }
    var parsed: string[] = [];
    for(var i = 0; i < songs.length; i++) {
        parsed.push(songs[i].videoDetails.videoId);
    }
    if(JSON.stringify(parsed).length > maxStrLen) {
        while(JSON.stringify(parsed).length > maxStrLen) {
            parsed.pop();
        }
    }
    return parsed;
}

export function MinutesToMilliseconds(minutes: number): number {
    return minutes * 60 * 1000;
}