const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const MysqlIntermediator = require('../mysql.js');
const { messageDelete, MilisecondsToTime } = require('../util.js');
const ytdl = require('ytdl-core');
const search = require('../search.js');

module.exports = {
    name: "info",
    description: "Mira la informacion sobre lo que esta sonando ahora",
    example: "{prefix}info (opcional){titulo / url}",
    args: [{name: "video", type: 'NUMBER', required: false, description: "puedes ver la informacion de otro video en la queue"}],
    alias: ["informacion", "estado", "now", "ahora"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({client, message, servers, prefix, args, server}) => {
        const Music = servers.get(message.guild.id);
        if(Music.isconnection === false || !Music.songs[0]) {
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`No hay ninguna cancion, si es un error avise al staff o ejecute \`${prefix}info\` ves al github y añade el error`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, message.member.id);
            return;
        }
        var SelectedVideo = 0;
        if(args[0]) {
            var parsed = parseInt(args[0]);
            SelectedVideo = parsed - 1;
            if(isNaN(parsed)) {
                SelectedVideo = 0;
            }
        }
        var video = Music.songs[SelectedVideo];
        if(!video) {
            video = Music.songs[0];
        }
        const embed = new Discord.MessageEmbed();
        embed.setTitle(`${video.videoDetails.title}`);
        embed.setDescription(`**Tiempo**: ${SelectedVideo == 0 ? `\`${MilisecondsToTime(Music.audioresource.audioPlayer.state.playbackDuration)}\`-` : ""}\`${MilisecondsToTime(video.videoDetails.lengthSeconds*1000)}\`
        **Url**: ${video.videoDetails.video_url}
        
        **Descripcion**: \`${video.videoDetails.description.length > 200 ? video.videoDetails.description.slice(0, 200-3) + "..." : video.videoDetails.description}\``);
        if(video.videoDetails.thumbnails.length >= 1) {
            embed.setImage(video.videoDetails.thumbnails[video.videoDetails.thumbnails.length-1].url);
        }
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await message.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, message.member.id);
        return;
    }
}