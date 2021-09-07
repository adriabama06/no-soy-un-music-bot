const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const MysqlIntermediator = require('../mysql.js');
const { waitReaction } = require('../util.js');

module.exports = {
    name: "join",
    description: "Haz que el bot se una a tu chat de voz, no es nececario ejecutar este comando siempre, un simple play ya se encarga de todo",
    example: "{prefix}join",
    alias: ["j", "unete"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({message, servers}) => {
        const Music = servers.get(message.guild.id);
        if(!message.member.voice.channel) {
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`Nececitas estar en un canal de voz para que el bot se pueda unir`);
            embed.setTimestamp();
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await waitReaction(msg, "❌", message.author.id);
            return;
        }
        Music.createConnection(message.member.voice.channel);
        return;
    }
}