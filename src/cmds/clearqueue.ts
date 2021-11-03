import { GuildMember, MessageEmbed } from 'discord.js';

import { CommandInterface, CommandRunInterface } from '../interfaces';
import { messageDelete } from '../util';

const command: CommandInterface = {
    name: 'clearqueue',
    info: {
        es: 'Borra una o varias canciones',
        en: 'Delete one or more songs'
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
                required: true,
                description: 'Desde donde empezar a borrar o cual borrar'
            },
            {
                name: 'to',
                type: 'INTEGER',
                required: false,
                description: 'Hasta donde borrar'
            }
        ],
        en: [
            {
                name: 'video',
                type: 'INTEGER',
                required: true,
                description: 'Where start deleting or delete one'
            },
            {
                name: 'to',
                type: 'INTEGER',
                required: false,
                description: 'How far to erase'
            }
        ]
    },
    alias: ["cq"],
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
        var from = interaction.options.getInteger('video', true);
        var to = interaction.options.getInteger('to');
        from -= 1;
        if(to) {
            to -= 1;
            to = to - from;
            music.songs.splice(from, to+1);
            const embed = new MessageEmbed();
            if(server.info.language === 'es') {
                embed.setDescription(`Se borraron ${from+to} canciones`);
            }
            if(server.info.language === 'en') {
                embed.setDescription(`Deleted ${from+to} songs`);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id);
            return;
        }
        if(from <= 0 || !music.songs[from]) {
            const embed = new MessageEmbed();
            if(server.info.language === 'es') {
                embed.setDescription(`Numero invalido`);
            }
            if(server.info.language === 'en') {
                embed.setDescription(`Invalid number`);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id);
            return;
        }
        var deleted = music.songs.splice(from, 1);
        const embed = new MessageEmbed();
        if(server.info.language === 'es') {
            embed.setDescription(`Se borro: [${deleted[0].videoDetails.title}](${deleted[0].videoDetails.video_url})`);
        }
        if(server.info.language === 'en') {
            embed.setDescription(`Deleted: [${deleted[0].videoDetails.title}](${deleted[0].videoDetails.video_url})`);
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