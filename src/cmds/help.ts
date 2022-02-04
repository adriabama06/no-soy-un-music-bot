import { GuildMember, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { CommandInterface } from '../interfaces';
import { messageDelete } from '../util';

const command: CommandInterface = {
    name: 'help',
    info: {
        es: 'Muestra todos los comandos del bot',
        en: 'Show all commands of the bot'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: undefined,
    alias: ["ayuda"],
    run: async ({interaction, DataBaseServer, Commands}): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        var texts: string[] = [];
        for(const command of Commands) {
            var name: string = '';
            if(command[1].name) {
                name = command[1].name;
            }

            var pref_bdesc: string = "";
            var bdesc: string = "";
            if(command[1].info) {
                var bd = command[1].info[DataBaseServer.info.language];
                if(bd) {
                    bdesc = bd;
                }
            }
            
            var pref_ldesc: string = "";
            var ldesc: string = "";
            if(command[1].longinfo) {
                var ld = command[1].longinfo[DataBaseServer.info.language];
                if(ld) {
                    ldesc = ld;
                }
            }

            var pref_alias: string = "";
            var alias: string = "";
            if(command[1].alias) {
                alias = command[1].alias.join(' | ');
            }
            if(DataBaseServer.info.language == 'es') {
                pref_bdesc = 'Descripcion basica';
                pref_ldesc = 'Descripcion completa';
                pref_alias = 'Alias';

                if(name == '') {
                    name = 'Nombre no puesto';
                }
                
                if(bdesc == '') {
                    bdesc = 'Descripcion basica no puesta';
                }

                if(ldesc == '') {
                    ldesc = 'Descripcion completa no puesta';
                } 
            }
            if(DataBaseServer.info.language == 'en') {
                pref_bdesc = 'Basic description';
                pref_ldesc = 'Full description';
                pref_alias = 'Alias';

                if(name == '') {
                    name = 'Name not set';
                }
                
                if(bdesc == '') {
                    bdesc = 'Basic description not set';
                }

                if(ldesc == '') {
                    ldesc = 'Full description not set';
                } 
            }

            texts.push(`
            
            **/${name}**
            **${pref_bdesc}**: ${bdesc}
            **${pref_ldesc}**: ${ldesc}
            **${pref_alias}**: ${alias}`);
        }

        var menu: string[] = [];
        var size: number = 5;

        for(var d = 0; d < texts.length; d+=size) {
            var toadd: string = "";
            var s: number = 0;
            while(s < size) {
                var t = texts[d+s];
                if(t) {
                    toadd += t;
                }
                s++;
            }
            menu.push(toadd);
        }
        const embed = new MessageEmbed();
        embed.setTimestamp();
        embed.setColor('RANDOM');
        if(DataBaseServer.info.language == 'es') {
            embed.setTitle('**Ayuda pagina**: 1');
        }
        if(DataBaseServer.info.language == 'en') {
            embed.setTitle('**Help page**: 1');
        }
        embed.setDescription(menu[0]);

        var msg = await interaction.channel.send({
            embeds: [embed]
        });
        if(texts.length < size) {
            await messageDelete(msg, interaction.member.id);
            return true;
        }
        var row = new MessageActionRow();
        row.addComponents(
            new MessageButton()
            .setCustomId('back')
            .setEmoji('⬅')
            .setStyle('SUCCESS')
        );
        row.addComponents(
            new MessageButton()
            .setCustomId('next')
            .setEmoji('➡')
            .setStyle('SUCCESS')
        );
        row.addComponents(
            new MessageButton()
            .setCustomId('exit')
            .setEmoji('❌')
            .setStyle('SECONDARY')
        );
        await msg.edit({
            components: [row]
        });
        const filter = (i: any) => (i.customId === 'back' || i.customId === 'next' || i.customId === 'exit');// && (i.user.id === .member.id);
        var index: number = 0;
        const collector = msg.createMessageComponentCollector({
            filter: filter,
            time: 4 * 1000 * 60
        });
        collector.on('collect', async (i) => {
            i.deferUpdate();
            if(i.customId === 'exit') {
                collector.stop('user');
                return;
            }
            if(i.customId === 'back') {
                if(index === 0 || index < 0) {
                    index = menu.length-1;
                    if(DataBaseServer.info.language == 'es') {
                        embed.setTitle(`**Ayuda pagina**: ${index+1}`);
                    }
                    if(DataBaseServer.info.language == 'en') {
                        embed.setTitle(`**Help page**: ${index+1}`);
                    }
                    embed.setDescription(menu[index]);
                    await msg.edit({
                        embeds: [embed]
                    });
                } else {
                    index--;
                    if(DataBaseServer.info.language == 'es') {
                        embed.setTitle(`**Ayuda pagina**: ${index+1}`);
                    }
                    if(DataBaseServer.info.language == 'en') {
                        embed.setTitle(`**Help page**: ${index+1}`);
                    }
                    embed.setDescription(menu[index]);
                    await msg.edit({
                        embeds: [embed]
                    });
                }
            } else if(i.customId === 'next') {
                if(index === menu.length-1 || index > menu.length-1) {
                    index = 0;
                    if(DataBaseServer.info.language == 'es') {
                        embed.setTitle(`**Ayuda pagina**: ${index+1}`);
                    }
                    if(DataBaseServer.info.language == 'en') {
                        embed.setTitle(`**Help page**: ${index+1}`);
                    }
                    embed.setDescription(menu[index]);
                    await msg.edit({
                        embeds: [embed]
                    });
                } else {
                    index++;
                    if(DataBaseServer.info.language == 'es') {
                        embed.setTitle(`**Ayuda pagina**: ${index+1}`);
                    }
                    if(DataBaseServer.info.language == 'en') {
                        embed.setTitle(`**Help page**: ${index+1}`);
                    }
                    embed.setDescription(menu[index]);
                    await msg.edit({
                        embeds: [embed]
                    });
                }
            }
        });
        collector.on('end', async (collected, reason) => {
            if(reason == 'messageDelete') {
                return;
            }
            if(msg.deleted == false && msg.deletable == true) {
                await msg.delete();
            }
        });
        return true;
    }
}


export default command;