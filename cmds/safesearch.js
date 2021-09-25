const Discord = require('discord.js');
const MysqlIntermediator = require('../mysql.js');
const { messageDelete } = require('../util.js');

module.exports = {
    name: "safesearch",
    description: "cambia el nivel de seguridad en las busquedas de youtube (no afecta a url's)",
    example: "{prefix}safesearch",
    args: [{name: "option", type: 'STRING', required: false, choices: [{name: 'set', value: 'set'}, {name: 'reset', value: 'reset'}], description: "set or reset options"}, {name: "level", type: 'STRING', required: false, choices: [{name: 'none', value: 'none'}, {name: 'medium', value: 'medium'}, {name: 'max', value: 'max'}], description: "set level"}],
    alias: ["safe", "busquedasegura", "busqueda"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({message, args, prefix, Mysql, config}) => {
        if(!args[0]) {
            const embed = new Discord.MessageEmbed();
            embed.setTitle("Error");
            embed.setDescription(`
            **Tienes que poner cual quieres que sea el nivel de seguridad**
            - \`${prefix}safesearch set {seguridad}\`
            
            **Reinicia la seguridad al original (${config.youtube.defaultsafesearch === 0 ? 'none' : 'medium'})**
            - \`${prefix}safesearch reset\``);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, message.member.id);
            return;
        }
        if(args[0].toLowerCase() === 'set') {
            if((!args[1]) || (args[1] != undefined && args[1].length <= 0) || (args[1] != undefined && args[1].length >= 20)) {
                const embed = new Discord.MessageEmbed();
                embed.setTitle("Error");
                embed.setDescription(`
                **Tienes que poner cual quieres que sea el nivel de seguridad**
                - \`${prefix}safesearch set {seguridad}\`
                
                **Reinicia la seguridad al original (${config.youtube.defaultsafesearch === 0 ? 'none' : 'medium'})**
                - \`${prefix}safesearch reset\``);
                embed.setTimestamp();
                embed.setColor("RANDOM");
                const msg = await message.channel.send({
                    embeds: [embed]
                });
                messageDelete(msg, message.member.id);
                return;
            }

            var convert = 0;

            if(args[1].toLowerCase() == 'none') {
                convert = 0;
            }
            if(args[1].toLowerCase() == 'medium') {
                convert = 1;
            }
            if(args[1].toLowerCase() == 'max') {
                convert = 2;
            }

            await Mysql.setSafeSearch(message.guild.id, convert, message.member.id);

            const embed = new Discord.MessageEmbed();
            embed.setTitle("SafeSearch cambiado");
            embed.setDescription(`Nuevo nivel de safesearch: **${args[1]}**`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, message.member.id);
            return;
        }
        if(args[0].toLowerCase() === 'reset') {
            await Mysql.setSafeSearch(message.guild.id, config.youtube.defaultsafesearch, message.member.id);

            const embed = new Discord.MessageEmbed();
            embed.setTitle("SafeSearch reiniciado");
            embed.setDescription(`Nuevo nivel de safesearch: **${config.youtube.defaultsafesearch === 0 ? 'none' : 'medium'}**`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, message.member.id);
            return;
        }
        return;
    }
}