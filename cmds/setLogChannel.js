const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const { messageDelete } = require('../util.js');

module.exports = {
    name: "setlogchannel",
    description: "cambia el canal donde se veran los cambios de cancion etc",
    example: "{prefix}setlogchannel",
    args: [],
    alias: ["channel", "setlog", "log"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({message, args, prefix, servers}) => {
        const Music = servers.get(message.guild.id);
        Music.setLogChannel(message.channel);
        const embed = new Discord.MessageEmbed();
        embed.setDescription(`Ahora cualquier cambio en la musica se notificara aqui`);
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await message.channel.send({
            embeds: [embed]
        });
        await messageDelete(msg, message.member.id, 15000);
        return;
    }
}