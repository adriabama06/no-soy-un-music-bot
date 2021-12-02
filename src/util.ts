import { Message, MessageActionRow, MessageButton } from 'discord.js';
import ytdl, { videoInfo } from 'ytdl-core';

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
   return new Date(time).toISOString().substr(11, 8);
}

export async function ParseQueue(queue: string): Promise<videoInfo[]> {
    var temptransform: string[] = JSON.parse(queue);
    var toreturn: videoInfo[] = [];
    for(const song of temptransform) {
        const video = await ytdl.getInfo(`https://www.youtube.com/watch?v=${song}`);
        toreturn.push(video);
    }
    return toreturn;
}
export async function UnParseQueue(songs: ytdl.videoInfo[], maxStrLen: number): Promise<string[]> {
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