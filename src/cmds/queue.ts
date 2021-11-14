import { GuildMember, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { getInfo, validateURL, VideoDetails, videoInfo } from 'ytdl-core';

import { CommandInterface, CommandRunInterface } from '../interfaces';
import search from '../search';
import { messageDelete } from '../util';

const command: CommandInterface = {
    name: 'queue',
    info: {
        es: 'Muestra o cambia la queue',
        en: 'Join to the vioce channel'
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
    alias: ["canciones"],
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
            messageDelete(msg, interaction.member.id);
            return;
        }
        var video = interaction.options.getString('video');
        if(video) {
            var v: videoInfo | undefined = undefined;
            if(validateURL(video)) {
                v = await getInfo(video);
            }
            if(!v) {
                const r = await search(video, server.safesearch.safesearch);
                if(r) {
                    v = await getInfo(r);
                }
            }
            if(!v) {
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
            return;
        }
        var texts: string[] = [];
        for(var i = 0; i < music.songs.length; i++) {
            var s = music.songs[i];
            var k: string = "";
            if(server.info.language === 'es') {
                k = '**Ahora:** ';
            }
            if(server.info.language === 'en') {
                k = '**Now:** ';
            }
            texts.push(`
            ${i === 0 ? k : ''}**[${i+1}]** -> [${s.videoDetails.title}](${s.videoDetails.video_url})`);
        }

        var menu: string[] = [];
        var size: number = 10;

        for(var i = 0; i < texts.length; i+=size) {
            var toadd: string = "";
            var ii: number = 0;
            while(ii < size) {
                var t = texts[i+ii];
                if(t) { // can be undefined, typescript don't know to this and don't show any error or warning
                    toadd += t;
                }
                ii++;
            }
            menu.push(toadd);
        }
        const embed = new MessageEmbed();
        embed.setTitle(`${music.songs.length > size ? '1 - ' : ''}**queue** : **${interaction.guild.name}**`);
        if(server.info.language == 'es') {
            embed.setDescription(`${menu.length === 0 ? 'no hay ninguna cancion' : menu[0]}`);
        }
        if(server.info.language == 'en') {
            embed.setDescription(`${menu.length === 0 ? 'there not songs' : menu[0]}`);
        }
        embed.setColor("RANDOM");

        const msg = await interaction.channel.send({
            embeds: [embed]
        });
        if(music.songs.length < size) {
            await messageDelete(msg, interaction.member.id);
            return true;
        }
        var row = new MessageActionRow();
        row.addComponents(
            new MessageButton()
            .setCustomId('back')
            .setEmoji('⬅')
            .setStyle('SUCCESS')
        );
        row.addComponents(
            new MessageButton()
            .setCustomId('next')
            .setEmoji('➡')
            .setStyle('SUCCESS')
        );
        row.addComponents(
            new MessageButton()
            .setCustomId('exit')
            .setEmoji('❌')
            .setStyle('SECONDARY')
        );
        await msg.edit({
            components: [row]
        });
        const filter = (i: any) => (i.customId === 'back' || i.customId === 'next' || i.customId === 'exit');// && (i.user.id === .member.id);
        var index: number = 0;
        const collector = msg.createMessageComponentCollector({
            filter: filter,
            time: 4 * 1000 * 60
        });
        var guildname: string = interaction.guild.name;
        collector.on('collect', async (i) => {
            i.deferUpdate();
            if(interaction.guild) {
                guildname = interaction.guild.name;
            }
            if(i.customId === 'exit') {
                collector.stop('user');
                return;
            }
            if(i.customId === 'back') {
                if(index === 0 || index < 0) {
                    index = menu.length-1;
                    embed.setTitle(`${index+1} - **queue** : **${guildname}**`);
                    embed.setDescription(menu[index]);
                    await msg.edit({
                        embeds: [embed]
                    });
                } else {
                    index--;
                    embed.setTitle(`${index+1} - **queue** : **${guildname}**`);
                    embed.setDescription(menu[index]);
                    await msg.edit({
                        embeds: [embed]
                    });
                }
            } else if(i.customId === 'next') {
                if(index === menu.length-1 || index > menu.length-1) {
                    index = 0;
                    embed.setTitle(`${index+1} - **queue** : **${guildname}**`);
                    embed.setDescription(menu[index]);
                    await msg.edit({
                        embeds: [embed]
                    });
                } else {
                    index++;
                    embed.setTitle(`${index+1} - **queue** : **${guildname}**`);
                    embed.setDescription(menu[index]);
                    await msg.edit({
                        embeds: [embed]
                    });
                }
            }
        });
        collector.on('end', async () => {
            await msg.delete();
        });
        return;
    }
}


export default command;