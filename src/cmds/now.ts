// this equals to info.js of old JavaScript
import { AudioPlayerPausedState, AudioPlayerPlayingState } from '@discordjs/voice';
import { GuildMember, MessageEmbed } from 'discord.js';

import { CommandInterface, CommandRunInterface } from '../interfaces';
import { messageDelete, MilisecondsToTime } from '../util';

function checkAudioType(object: any): object is AudioPlayerPlayingState | AudioPlayerPausedState {
    return 'playbackDuration' in object;
}

const command: CommandInterface = {
    name: 'now',
    info: {
        es: 'Info sobre la cancion',
        en: 'Info abot the song'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: {
        es: [
            {
                name: 'video',
                type: 'INTEGER',
                required: false,
                description: 'Volumend de 0 hasta 100'
            }
        ],
        en: [
            {
                name: 'video',
                type: 'INTEGER',
                required: false,
                description: 'Volume from 0 to 100'
            }
        ]
    },
    alias: ['playing', 'info'],
    run: async ({interaction, server, music}: CommandRunInterface): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        if(!interaction.member.voice.channel) {
            const embed = new MessageEmbed();
            if(server.info.language === 'es') {
                embed.setDescription(`No veo que estes en un canal de voz, evita molestar a los demas`);
            }
            if(server.info.language === 'en') {
                embed.setDescription(`I can't see you in a voice channel, avoid disturbing others`);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id);
            return;
        }
        if(!music.connection || !music.audioresource || !music.audioresource.audioPlayer || !checkAudioType(music.audioresource.audioPlayer.state)) {
            const embed = new MessageEmbed();
            if(server.info.language === 'es') {
                embed.setDescription(`No estoy conectado en ningun canal de voz, verifica los canales, prueba de ejecutar: \`/join\` si no se repara avise a un staff, o ejecute \`/info\` ves al github y añade el error`);
            }
            if(server.info.language === 'en') {
                embed.setDescription(`I'm not connected right now in a voice channel, try make join to voice: \`/join\` or call to staff, or execute \`/info\` and at github add the error`);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id);
            return;
        }
        var SelectedVideo = 1;
        var n = interaction.options.getInteger('video');
        if(n) {
            if(music.songs[n-1]) {
                SelectedVideo = n;
            }
        }
        var video = music.songs[SelectedVideo-1];
        const embed = new MessageEmbed();
        embed.setTitle(video.videoDetails.title);
        embed.setURL(video.videoDetails.video_url);
        if(server.info.language === 'es') {
            embed.setDescription(`**Tiempo**: ${SelectedVideo == 1 ? `\`${MilisecondsToTime(music.audioresource.audioPlayer.state.playbackDuration)}\`-` : ''}\`${MilisecondsToTime(parseInt(video.videoDetails.lengthSeconds)*1000)}\`
            **Url**: ${video.videoDetails.video_url}
            
            **Descripción**: \`${video.videoDetails.description ?
                video.videoDetails.description.length > 200 ? video.videoDetails.description.slice(0, 200-3) + "..." : video.videoDetails.description
                : 'No tiene descripción'}\``);
            if(video.videoDetails.thumbnails.length >= 1) {
                embed.setImage(video.videoDetails.thumbnails[video.videoDetails.thumbnails.length-1].url);
            }
        }
        if(server.info.language === 'en') {
            embed.setDescription(`**Time**: ${SelectedVideo == 1 ? `\`${MilisecondsToTime(music.audioresource.audioPlayer.state.playbackDuration)}\`-` : ''}\`${MilisecondsToTime(parseInt(video.videoDetails.lengthSeconds)*1000)}\`
            **Url**: ${video.videoDetails.video_url}
            
            **Description**: \`${video.videoDetails.description ?
                video.videoDetails.description.length > 200 ? video.videoDetails.description.slice(0, 200-3) + "..." : video.videoDetails.description
                : 'This video has no description'}\``);
            if(video.videoDetails.thumbnails.length >= 1) {
                embed.setImage(video.videoDetails.thumbnails[video.videoDetails.thumbnails.length-1].url);
            }
        }
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await interaction.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, interaction.member.id);
        return true;
    }
}


export default command;