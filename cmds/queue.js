const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const MysqlIntermediator = require('../mysql.js');
const { waitReaction } = require('../util.js');
const ytdl = require('ytdl-core');
const search = require('../search.js');

module.exports = {
    name: "queue",
    description: "Añade o visualiza la queue para ver las canciones que hay",
    example: "{prefix}queue (opcional){titulo / url}",
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
            await waitReaction(msg, "❌", message.author.id, true, true, 15000);
            return;
        }
        if(args[0]) {
            var video = undefined;
            if(ytdl.validateURL(args[0])) {
                video = await ytdl.getInfo(args[0]);
            }
            if(video === undefined) {
                const r = await search(args[0], server.safesearch.safesearch);
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
                await waitReaction(msg, "❌", message.author.id, true, true, 15000);
            } else {
                Music.songs.push(video);
                const embed = new Discord.MessageEmbed();
                embed.setDescription(`se añadio [${video.videoDetails.title}](${video.videoDetails.video_url}) a la queue`);
                embed.setTimestamp();
                embed.setColor("RANDOM");
                const msg = await message.channel.send({
                    embeds: [embed]
                });
                await waitReaction(msg, "❌", message.author.id, true, true, 15000);
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
            await msg.react('⬅');
            await msg.react('➡');
            await msg.react('❌');
            const filter = (reaction, user) => {
                return ['⬅', '➡', '❌'].includes(reaction.emoji.name) && !user.bot && user.id != client.user.id;
            }
            var index = 0;
            const collector = msg.createReactionCollector({filter: filter, time: 4 * 1000 * 60 });
            collector.on('collect', async (reaction, user) => {
                await reaction.users.remove(user.id);
                if(reaction.emoji.name === '❌') {
                    collector.stop();
                    return;
                }
                if(reaction.emoji.name === '⬅') {
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
                } else if(reaction.emoji.name === '➡') {
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
                await msg.reactions.removeAll();
                await msg.delete({ timeout: 5000 });
            });
        } else {
            await waitReaction(msg, '❌', message.author.id, true, true, 4 * 1000 * 60);
        }
        return;
    }
}