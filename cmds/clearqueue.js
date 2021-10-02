const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const MysqlIntermediator = require('../mysql.js');
const { messageDelete } = require('../util.js');

module.exports = {
    name: "clearqueue",
    description: "Remueve canciones de la queue",
    example: "{prefix}clearqueue (opcional){titulo / url}",
    args: [{name: "video", type: 'NUMBER', required: false, description: "desde donde empezar a borrar o cual borrar"}, {name: "to", type: 'NUMBER', required: false, description: "hasta donde borrar"}],
    alias: ["cq", "clear", "limpia", "remove"],
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
            await messageDelete(msg, message.member.id);
            return;
        }
        if(!args[0]) {
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`Usa ${prefix}help para ver como usar este comando`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await messageDelete(msg, message.member.id);
            return;
        }
        var from = args[0];
        if(isNaN(from)) {
            from = parseInt(args[0]);
        }
        from -= 1;
        if(args[1]) {
            var to = args[1];
            if(isNaN(to)) {
                to = parseInt(args[1]);
            }
            to -= 1;
            to = to - from;
            Music.songs.splice(from, to+1);
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`Se borraron ${from+to} canciones`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, message.member.id);
            return;
        }
        var deleted = Music.songs.splice(from, from);
        const embed = new Discord.MessageEmbed();
        embed.setDescription(`Se borro [${deleted[0].videoDetails.title}](${deleted[0].videoDetails.video_url})`);
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await message.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, message.member.id);
        return;
    }
}