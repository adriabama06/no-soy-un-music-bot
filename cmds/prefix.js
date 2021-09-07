const Discord = require('discord.js');
const MysqlIntermediator = require('../mysql.js');
const { waitReaction } = require('../util.js');

module.exports = {
    name: "prefix",
    description: "Cambia el prefix de tu servidor",
    example: "{prefix}prefix set {nuevo prefix}",
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
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await waitReaction(msg, "❌", message.author.id);
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
                const msg = await message.channel.send({
                    embeds: [embed]
                });
                await waitReaction(msg, "❌", message.author.id);
                return;
            }

            await Mysql.setPrefix(message.guild.id, args[1], message.author.id);

            const embed = new Discord.MessageEmbed();
            embed.setTitle("Prefix cambiado");
            embed.setDescription(`Ahora el nuevo prefix es: ${args[1]}`);
            embed.setTimestamp();
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await waitReaction(msg, "❌", message.author.id);
            return;
        }
        if(args[0].toLowerCase() === 'reset') {
            await Mysql.setPrefix(message.guild.id, config.discord.defaultprefix, message.author.id);

            const embed = new Discord.MessageEmbed();
            embed.setTitle("Prefix reiniciado");
            embed.setDescription(`Ahora el nuevo prefix es: ${config.discord.defaultprefix}`);
            embed.setTimestamp();
            const msg = await message.channel.send({
                embeds: [embed]
            });
            await waitReaction(msg, "❌", message.author.id);
            return;
        }
    }
}