const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const MysqlIntermediator = require('../mysql.js');
const { messageDelete } = require('../util.js');

module.exports = {
    name: "leave",
    description: "Haz que el bot salga de tu chat de voz, no es nececario ejecutar este comando siempre, un simple stop ya se encarga de todo, usando stop te aseguras de que si estavas escuchando una cancion se guarde para mas tarde continuar",
    example: "{prefix}leave",
    alias: ["l", "sal"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({message, servers, prefix}) => {
        const Music = servers.get(message.guild.id);
        if(!message.member.voice.channel) {
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`Nececitas estar en un canal de voz para que el bot te haga caso, no molestes a los demas`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await messageDelete(msg, message.author.id);
            return;
        }
        if(Music.isconnection === false) {
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`No estoy conectado a ningun canal, si ya estoy en uno y no salgo sale este error prueba de ejecutar: \`${prefix}join\` si no se repara avise a un staff, o ejecute \`${prefix}info\` ves al github y añade el error`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await messageDelete(msg, message.author.id);
            return;
        }
        Music.endConnection();
        Music.endPlayer();
        const embed = new Discord.MessageEmbed();
        embed.setDescription(`adios !`);
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await message.channel.send({
            embeds: [embed]
        });
        await messageDelete(msg, message.author.id, 15000);
        return;
    }
}