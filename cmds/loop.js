const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const { messageDelete } = require('../util.js');

module.exports = {
    name: "loop",
    description: "activa el modo repeticion",
    example: "{prefix}loop",
    args: [],
    alias: ["bucle", "repetir"],
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
        const embed = new Discord.MessageEmbed();
        if(Music.options.loop === false) {
            embed.setTitle(`Se habilito el modo repeticion`);
            Music.options.loop = true;
        } else {
            embed.setTitle(`Se deshabilito el modo repeticion`);
            Music.options.loop = false;
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