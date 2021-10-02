const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const MysqlIntermediator = require('../mysql.js');
const { messageDelete } = require('../util.js');

module.exports = {
    name: "savequeue",
    description: "Guarda la queue para cargar en cualquier momento",
    example: "{prefix}savequeue",
    args: [],
    alias: ["save", "guardar", "guardarqueue"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({client, message, servers, prefix, args, Mysql}) => {
        const Music = servers.get(message.guild.id);
        if(Music.songs.length <= 0) {
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`Espera... Que? No hay ninguna canción en la queue? Entonces que quieres guardar?, si es un error avise al staff o ejecute \`${prefix}info\` ves al github y añade el error`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, message.member.id);
            return;
        }
        var parsed = [];
        for(var i = 0; i < Music.songs.length; i++) {
            parsed.push(Music.songs[i].videoDetails.videoId);
        }
        if(JSON.stringify(parsed).length > 535) {
            while(JSON.stringify(parsed).length > 535) {
                parsed.pop();
            }
        }
        await Mysql.setQueue(message.guild.id, parsed, message.member.id);
        const embed = new Discord.MessageEmbed();
        embed.setDescription(`Se guardo la queue ahora la puedes cargar cuando quieras con ${prefix}loadqueue, ! por ahora solo se guardaran hasta ~48 canciones`);
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await message.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, message.member.id);
        return;
    }
}