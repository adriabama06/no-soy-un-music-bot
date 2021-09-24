const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const { messageDelete } = require('../util.js');

module.exports = {
    name: "stop",
    description: "para la musica y elimina la queue",
    example: "{prefix}stop",
    args: [],
    alias: ["detente", "end"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({message, args, prefix, servers}) => {
        const Music = servers.get(message.guild.id);
        if(!message.member.voice.channel) {
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`Nececitas estar en un canal de voz para que el bot te haga caso, evita molestar a los demas`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, message.member.id, 15000);
            return;
        }
        if(Music.isconnection === false) {
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
        Music.songs = [];
        Music.end();
        const embed = new Discord.MessageEmbed();
        embed.setTitle(`Se finalizo la musica y se borro la queue`);
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await message.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, message.member.id);
        return;
    }
}