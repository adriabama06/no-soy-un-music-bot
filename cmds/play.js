const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const MysqlIntermediator = require('../mysql.js');
const { messageDelete } = require('../util.js');
const ytdl = require('ytdl-core');
const search = require('../search.js');

module.exports = {
    name: "play",
    description: "Utiliza este comando tanto como para iniciar una queue creada como para empezar una nueva, ahorra tiempo evitando que usar {prefix}join ya que este lo hara automaticamente ademas de que tambien puedes usarlo para añadir canciones a la queue",
    example: "{prefix}play {titulo / url}",
    alias: ["p", "inicia", "start"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({message, servers, prefix, args}) => {
        const Music = servers.get(message.guild.id);
        if(!message.member.voice.channel) {
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`Nececitas estar en un canal de voz para que el bot te haga caso, evita molestar a los demas`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await messageDelete(msg, message.author.id, 15000);
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
                messageDelete(msg, message.author.id, 15000);
            } else {
                Music.songs.push(video);
                const embed = new Discord.MessageEmbed();
                embed.setDescription(`se añadio [${video.videoDetails.title}](${video.videoDetails.video_url}) a la queue`);
                embed.setTimestamp();
                embed.setColor("RANDOM");
                const msg = await message.channel.send({
                    embeds: [embed]
                });
                messageDelete(msg, message.author.id, 15000);
            }
        }
        if(Music.isconnection === false || Music.connection === undefined) {
            Music.createConnection(message.member.voice.channel);
        }
        if(Music.isdispatcher === false || Music.dispatcher === undefined) {
            Music.play();
            Music.setLogChannel(message.channel);
        }
        return;
    }
}