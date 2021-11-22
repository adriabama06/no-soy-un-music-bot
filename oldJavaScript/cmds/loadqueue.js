const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const MysqlIntermediator = require('../mysql.js');
const { messageDelete } = require('../util.js');

module.exports = {
    name: "loadqueue",
    description: "Carga queue guardada",
    example: "{prefix}loadqueue",
    args: [],
    alias: ["load", "cargaqueue"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({client, message, servers, prefix, args, Mysql}) => {
        const Music = servers.get(message.guild.id);
        var server = Mysql.get(message.guild.id);
        if(server.queues.queue.length <= 0) {
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`Espera... Que? No hay ninguna queue guardada? Entonces que quieres cargar?, si es un error avise al staff o ejecute \`${prefix}info\` ves al github y añade el error`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, message.member.id);
            return;
        }
        if(typeof server.queues.queue == 'string') {
            await Mysql.parsequeue(message.guild.id);
        }
        Music.songs.push(...server.queues.queue);
        const embed = new Discord.MessageEmbed();
        embed.setDescription(`Se cargo la queue! Utiliza ${prefix}savequeue para guardar una nueva queue, la cargada no se ha borrado si quieres puedes replazarla, ! por ahora solo se guardaran hasta ~48 canciones`);
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await message.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, message.member.id);
        return;
    }
}