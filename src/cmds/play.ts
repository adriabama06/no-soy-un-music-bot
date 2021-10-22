import { GuildMember, MessageEmbed } from 'discord.js';
import { getInfo, validateURL, videoInfo } from 'ytdl-core';

import { CommandInterface, CommandRunInterface } from '../interfaces';
import search from '../search';
import { messageDelete } from '../util';

const command: CommandInterface = {
    name: 'play',
    info: {
        es: 'Pon una cancion',
        en: 'Play an song'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: {
        es: [
            {
                name: 'video',
                type: 'STRING',
                required: false,
                description: 'Pon un url o nombre'
            }
        ],
        en: [
            {
                name: 'video',
                type: 'STRING',
                required: false,
                description: 'Put an url or name'
            }
        ]
    },
    alias: ["pon"],
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
                embed.setDescription(`Nececitas estar en un canal, evita molestar a los demas`);
            }
            if(server.info.language === 'en') {
                embed.setDescription(`I can't see you in a voice channel, avoid disturbing others`);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            await messageDelete(msg, interaction.member.id);
            return;
        }
        var video = interaction.options.getString('video');
        if(video) {
            var v: videoInfo | undefined = undefined;
            if(validateURL(video)) {
                v = await getInfo(video);
            }
            if(video === null) {
                const r = await search(video, server.safesearch.safesearch);
                if(r) {
                    v = await getInfo(r);
                }
            }
            if(v === undefined) {
                const embed = new MessageEmbed();
                if(server.info.language === 'es') {
                    embed.setDescription(`No se pudo encontrar el video, verifique si el url o el titulo es correcto`);
                }
                if(server.info.language === 'en') {
                    // I'm not going to add all in english now
                }
                embed.setTimestamp();
                embed.setColor("RANDOM");
                const msg = await interaction.channel.send({
                    embeds: [embed]
                });
                messageDelete(msg, interaction.member.id);
            } else {
                music.songs.push(v);
                const embed = new MessageEmbed();
                if(server.info.language === 'es') {
                    embed.setDescription(`Se añadio [${v.videoDetails.title}](${v.videoDetails.video_url}) a la queue`);
                }
                embed.setTimestamp();
                embed.setColor("RANDOM");
                const msg = await interaction.channel.send({
                    embeds: [embed]
                });
                messageDelete(msg, interaction.member.id);
            }
        }

        if(!music.connection) {
            music.createConnection(interaction.member.voice.channel);
        }
        const embed = new MessageEmbed();
        
        if(server.info.language === 'es') {
            embed.setDescription(`¡ Me acabo de conectar !`);
        }
        if(server.info.language === 'en') {
            embed.setDescription(`I just join !`);
        }
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await interaction.channel.send({
            embeds: [embed]
        });
        await messageDelete(msg, interaction.member.id);
        return true;
    }
}


export default command;