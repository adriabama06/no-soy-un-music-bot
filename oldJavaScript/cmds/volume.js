const Discord = require('discord.js');
const ServerManager = require('../servers.js');
const { messageDelete } = require('../util.js');

module.exports = {
    name: "volume",
    description: "cambia el volumen de la musica",
    example: "{prefix}volume",
    args: [{name: "volume", type: 'NUMBER', required: false, choices: [{name: '100%', value: 100}, {name: '75%', value: 75}, {name: '50%', value: 50}, {name: '25%', value: 25}, {name: '5%', value: 5}], description: "volumenes predefinidos, puedes poner el valor que quieras"}],
    alias: ["volumen", "v"],
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
        var volume = args[0];
        if(isNaN(args[0])) {
            volume = parseFloat(args[0]);
        }
        if(args[0] && volume != undefined && isNaN(volume) === false) {
            Music.setVolume(volume);
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`Se cambio el volumen a \`${volume.toString()}%\``);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, message.member.id);
            return;
        }
        const embed = new Discord.MessageEmbed();
        embed.setTitle(`El volumen actual es: \`${Music.options.volume.toString()}%\``);
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await message.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, message.member.id);
        return;
    }
}