const Discord = require('discord.js');
const MysqlIntermediator = require('../mysql.js');
const { messageDelete } = require('../util.js');

module.exports = {
    name: "prefix",
    description: "Cambia el prefix de tu servidor",
    example: "{prefix}prefix set {nuevo prefix}",
    args: [{name: "option", type: 'STRING', required: false, choices: [{name: 'set', value: 'set'}, {name: 'reset', value: 'reset'}], description: "set or reset options"}, {name: "prefix", type: 'STRING', required: false, description: "set prefix for option set"}],
    alias: ["prefijo"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server}} param0 
     */
    run: async ({message, args, prefix, Mysql, config}) => {
        if(!args[0]) {
            const embed = new Discord.MessageEmbed();
            embed.setTitle("Error");
            embed.setDescription(`
            **Cambia el prefix de tu servidor**
            - \`${prefix}prefix set {nuevo prefix}\`
            
            **Reinicia el prefix al original (${config.discord.defaultprefix})**
            - \`${prefix}prefix reset\``);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await messageDelete(msg, message.member.id);
            return;
        }

        if(args[0].toLowerCase() === 'set') {
            if((!args[1]) || (args[1] != undefined && args[1].length <= 0) || (args[1] != undefined && args[1].length >= 20)) {
                const embed = new Discord.MessageEmbed();
                embed.setTitle("Error");
                embed.setDescription(`
                **Cambia el prefix de tu servidor**
                - \`${prefix}prefix set {nuevo prefix} << No puede ser 0 caracteres o mas de 20 caracteres\`
                
                **Reinicia el prefix al original (${config.discord.defaultprefix})**
                - \`${prefix}prefix reset\``);
                embed.setTimestamp();
                embed.setColor("RANDOM");
                const msg = await message.channel.send({
                    embeds: [embed]
                });
                await messageDelete(msg, message.member.id);
                return;
            }

            await Mysql.setPrefix(message.guild.id, args[1], message.member.id);

            const embed = new Discord.MessageEmbed();
            embed.setTitle("Prefix cambiado");
            embed.setDescription(`Ahora el nuevo prefix es: ${args[1]}`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await messageDelete(msg, message.member.id);
            return;
        }
        if(args[0].toLowerCase() === 'reset') {
            await Mysql.setPrefix(message.guild.id, config.discord.defaultprefix, message.member.id);

            const embed = new Discord.MessageEmbed();
            embed.setTitle("Prefix reiniciado");
            embed.setDescription(`Ahora el nuevo prefix es: ${config.discord.defaultprefix}`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await messageDelete(msg, message.member.id);
            return;
        }
        return;
    }
}