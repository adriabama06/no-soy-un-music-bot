const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const MysqlIntermediator = require('../mysql.js');
const { messageDelete } = require('../util.js');
const ytdl = require('ytdl-core');
const search = require('../search.js');

module.exports = {
    name: "queue",
    description: "Añade o visualiza la queue para ver las canciones que hay",
    example: "{prefix}queue (opcional){titulo / url}",
    args: [{name: "video", type: 'STRING', required: false, description: "pon el url o el titulo del video"}],
    alias: ["q", "lista", "songs", "canciones"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({client, message, servers, prefix, args, server}) => {
        const Music = servers.get(message.guild.id);
        if(!message.member.voice.channel) {
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`Nececitas estar en un canal de voz para que el bot te haga caso, evita molestar a los demas`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, message.member.id);
            return;
        }
        if(args[0]) {
            var video = undefined;
            if(ytdl.validateURL(args[0])) {
                video = await ytdl.getInfo(args[0]);
            }
            if(video === undefined) {
                const r = await search(args.join(" "), server.safesearch.safesearch);
                if(typeof r === 'string') {
                    video = await ytdl.getInfo(r);
                }
            }
            if(video === undefined) {
                const embed = new Discord.MessageEmbed();
                embed.setDescription(`no se pudo encontrar el video, verifique si el url o el titulo es correcto`);
                embed.setTimestamp();
                embed.setColor("RANDOM");
                const msg = await message.channel.send({
                    embeds: [embed]
                });
                messageDelete(msg, message.member.id, 15000);
            } else {
                Music.songs.push(video);
                const embed = new Discord.MessageEmbed();
                embed.setDescription(`se añadio [${video.videoDetails.title}](${video.videoDetails.video_url}) a la queue`);
                embed.setTimestamp();
                embed.setColor("RANDOM");
                const msg = await message.channel.send({
                    embeds: [embed]
                });
                messageDelete(msg, message.member.id, 15000);
            }
            return;
        }
        var textos = [];
        for(var i = 0; i < Music.songs.length; i++) {
            textos.push(`
            **[${i+1}]** -> [${Music.songs[i].videoDetails.title}](${Music.songs[i].videoDetails.video_url})`);
        }

        var menu = [];
        var capazidad = 10;

        for(var i = 0; i < textos.length; i+=capazidad) {
            var toadd = ``;
            var ii = 0;
            while(ii < capazidad) {
                if(textos[i+ii]) {
                    toadd += textos[i+ii];
                }
                ii++;
            }
            menu.push(toadd);
        }

        const embed = new Discord.MessageEmbed();
        embed.setTitle(`Queue : ${message.guild.name}`);
        embed.setDescription(menu.length === 0 ? 'no hay ninguna cancion' : menu[0]);
        embed.setTimestamp();
        embed.setColor("RANDOM");
        
        var msg = await message.channel.send({
            embeds: [embed],
        });
        if(Music.songs.length > capazidad) {
            var row = new Discord.MessageActionRow()
            row.addComponents(
                new Discord.MessageButton()
                .setCustomId('back')
                .setEmoji('⬅')
                .setStyle('SUCCESS'))
            row.addComponents(
                new Discord.MessageButton()
                .setCustomId('next')
                .setEmoji('➡')
                .setStyle('SUCCESS'))
            row.addComponents(
                new Discord.MessageButton()
                .setCustomId('exit')
                .setEmoji('❌')
                .setStyle('SECONDARY'));
            await msg.edit({ components: [row] });
            const filter = (i) => (i.customId === 'back' || i.customId === 'next' || i.customId === 'exit') && (i.user.id === message.member.id);
            var index = 0;
            const collector = msg.createMessageComponentCollector({filter, time: 4 * 1000 * 60 });
            collector.on('collect', async (i) => {
                await i.deferUpdate();
                if(i.customId === 'exit') {
                    collector.stop('user');
                    return;
                }
                if(i.customId === 'back') {
                    if(index === 0 || index < 0) {
                        index = menu.length-1;
                        embed.setTitle(`${index+1} - queue : ${message.guild.name}`);
                        embed.setDescription(menu[index]);
                        await msg.edit({
                            embeds: [embed]
                        });
                    } else {
                        index--;
                        embed.setTitle(`${index+1} - queue : ${message.guild.name}`);
                        embed.setDescription(menu[index]);
                        await msg.edit({
                            embeds: [embed]
                        });
                    }
                } else if(i.customId === 'next') {
                    if(index === menu.length-1 || index > menu.length-1) {
                        index = 0;
                        embed.setTitle(`${index+1} - queue : ${message.guild.name}`);
                        embed.setDescription(menu[index]);
                        await msg.edit({
                            embeds: [embed]
                        });
                    } else {
                        index++;
                        embed.setTitle(`${index+1} - queue : ${message.guild.name}`);
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
        } else {
            messageDelete(msg, message.member.id, 4 * 1000 * 60);
        }
        return;
    }
}