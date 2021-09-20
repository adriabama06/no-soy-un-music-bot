const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const MysqlIntermediator = require('../mysql.js');
const { messageDelete } = require('../util.js');

module.exports = {
    name: "join",
    description: "Haz que el bot se una a tu chat de voz, no es nececario ejecutar este comando siempre, un simple play ya se encarga de todo",
    example: "{prefix}join",
    alias: ["j", "unete"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({message, servers, prefix}) => {
        const Music = servers.get(message.guild.id);
        if(!message.member.voice.channel) {
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`Nececitas estar en un canal de voz para que el bot se pueda unir`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await messageDelete(msg, message.author.id);
            return;
        }
        if(Music.isconnection === true) {
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`Ya estoy conectado, verifica los canales, si no estoy ejecuta: \`${prefix}leave\` si no se repara avise a un staff, o ejecute \`${prefix}info\` ves al github y añade el error`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await messageDelete(msg, message.author.id);
            return;
        }
        Music.createConnection(message.member.voice.channel);
        const embed = new Discord.MessageEmbed();
        embed.setDescription(`me acabo de conectar !`);
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await message.channel.send({
            embeds: [embed]
        });
        await messageDelete(msg, message.author.id);
        return;
    }
}