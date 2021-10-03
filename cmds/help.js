const Discord = require('discord.js');
const { messageDelete } = require('../util.js');

module.exports = {
    name: "help",
    description: "muestra todos los comandos",
    example: "{prefix}help",
    args: [],
    alias: ["ayuda", "comandos"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, args: Discord.ApplicationCommandOptionData[], alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({message, args, prefix, commands}) => {

        var textos = [];
        for(const command of commands) {
            textos.push(`
            
            **${prefix}${command[1].name}**
            **Info**: ${command[1].description}
            **Uso**: ${command[1].example.replace("{prefix}", prefix)}
            **Alias**: ${command[1].alias.length === 0 ? "no hay alias" : command[1].alias.join(" | ")}`);
        }

        /**
         * @type {string[]}
         */
        var menu = [];
        var capazidad = 5;

        for(var i = 0; i < textos.length; i+=capazidad) {
            var toadd = ``;
            var ii = 0;
            while(ii < capazidad) {
                if(textos[i+ii]) {
                    toadd += textos[i+ii];
                }
                ii++;
            }
            menu.push(toadd);
        }

        const embed = new Discord.MessageEmbed();
        embed.setTitle(`Help - pagina: 1`);
        embed.setDescription(menu[0]);
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await message.channel.send({
            embeds: [embed]
        });
        var row = new Discord.MessageActionRow()
            row.addComponents(
                new Discord.MessageButton()
                .setCustomId('back')
                .setEmoji('⬅')
                .setStyle('SUCCESS'))
            row.addComponents(
                new Discord.MessageButton()
                .setCustomId('next')
                .setEmoji('➡')
                .setStyle('SUCCESS'))
            row.addComponents(
                new Discord.MessageButton()
                .setCustomId('exit')
                .setEmoji('❌')
                .setStyle('SECONDARY'));
        await msg.edit({ components: [row] });
        const filter = (i) => (i.customId === 'back' || i.customId === 'next' || i.customId === 'exit') && (i.user.id === message.member.id);
        var index = 0;
        const collector = msg.createMessageComponentCollector({filter, time: 4 * 1000 * 60 });
        collector.on('collect', async (i) => {
            await i.deferUpdate();
            if(i.customId === 'exit') {
                collector.stop('user');
                return;
            }
            if(i.customId === 'back') {
                if(index === 0 || index < 0) {
                    index = menu.length-1;
                    embed.setTitle(`Help - pagina: ${index+1}`);
                    embed.setDescription(menu[index]);
                    await msg.edit({
                        embeds: [embed]
                    });
                } else {
                    index--;
                    embed.setTitle(`Help - pagina: ${index+1}`);
                    embed.setDescription(menu[index]);
                    await msg.edit({
                        embeds: [embed]
                    });
                }
            } else if(i.customId === 'next') {
                if(index === menu.length-1 || index > menu.length-1) {
                    index = 0;
                    embed.setTitle(`Help - pagina: ${index+1}`);
                    embed.setDescription(menu[index]);
                    await msg.edit({
                        embeds: [embed]
                    });
                } else {
                    index++;
                    embed.setTitle(`Help - pagina: ${index+1}`);
                    embed.setDescription(menu[index]);
                    await msg.edit({
                        embeds: [embed]
                    });
                }
            }
        });
        collector.on('end', async () => {
            await msg.delete();
        });
        return;
    }
}