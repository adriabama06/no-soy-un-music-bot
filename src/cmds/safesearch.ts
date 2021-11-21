import { GuildMember, MessageEmbed } from 'discord.js';
import config from '../config';
import { CommandInterface, CommandRunInterface } from '../interfaces';
import { messageDelete } from '../util';

type options = 'set' | 'reset';
function checkOptions(object: string): object is options {
    return ['set', 'reset'].includes(object);
}
type levelsByName = 'low' | 'medium' | 'max';
function checkLevels(object: string): object is levelsByName {
    return ['low', 'medium', 'max'].includes(object);
}
type levelsByLevel = '0' | '1' | '2';
function getByName(name: levelsByName | string): levelsByLevel {
    switch (name) {
        case 'low':
            return '0';
        case 'medium':
            return '1';
        case 'max':
            return '2';
        default:
            return config.default.safesearch;
    }
}
function getByLevel(level: levelsByLevel | string): levelsByName {
    switch (level) {
        case '0':
            return 'low';
        case '1':
            return 'medium';
        case '2':
            return 'max';
        default:
            return getByLevel(config.default.safesearch);
    }
}

const command: CommandInterface = {
    name: 'safesarch',
    info: {
        es: 'Cambia el nivel de seguridad en busqueda',
        en: 'Show the bot information'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: {
        es: [
            {
                name: 'option',
                type: 'STRING',
                required: false,
                description: 'Pon o reinicia',
                choices: [
                    {name: 'Pon', value: 'set'},
                    {name: 'Reinicia', value: 'reset'}
                ]
            },
            {
                name: 'level',
                type: 'STRING',
                required: false,
                description: 'Nivel para poner',
                choices: [
                    {name: 'Bajo', value: 'low'},
                    {name: 'Medio', value: 'medium'},
                    {name: 'Maximo', value: 'max'}
                ]
            }
        ],
        en: [
            {
                name: 'option',
                type: 'STRING',
                required: false,
                description: 'Set or reset',
                choices: [
                    {name: 'Set', value: 'set'},
                    {name: 'Reset', value: 'reset'}
                ]
            },
            {
                name: 'level',
                type: 'STRING',
                required: false,
                description: 'Level to set',
                choices: [
                    {name: 'Low', value: 'low'},
                    {name: 'Medium', value: 'medium'},
                    {name: 'Max', value: 'max'}
                ]
            }
        ]
    },
    alias: undefined,
    run: async ({interaction, server, Mysql}: CommandRunInterface): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        var opt = interaction.options.getString('option');
        if(!opt || (typeof opt == 'string' && !checkOptions(opt))) {
            const embed = new MessageEmbed();
            if(server.info.language === 'es') {
                embed.setTitle(`El nivel de safesarch esta en: \`${getByLevel(server.safesearch.safesearch)}\``);
            }
            if(server.info.language === 'en') {
                embed.setTitle(`Safesearch level is: \`${getByLevel(server.safesearch.safesearch)}\``);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id);
            return;
        }
        switch(opt) {
            case 'set':
                var level = interaction.options.getString('level');
                if(!level || (typeof level == 'string' && !checkLevels(level))) {
                    var ableLevels: levelsByName[] = ['low', 'medium', 'max'];
                    const embed = new MessageEmbed();
                    if(server.info.language === 'es') {
                        embed.setTitle(`Ponga un nivel: \`${ableLevels.join(', ')}\``);
                    }
                    if(server.info.language === 'en') {
                        embed.setTitle(`Set an level: \`${ableLevels.join(', ')}\``);
                    }
                    embed.setTimestamp();
                    embed.setColor("RANDOM");
                    const msg = await interaction.channel.send({
                        embeds: [embed]
                    });
                    messageDelete(msg, interaction.member.id);
                    return;
                }
                Mysql.setSafeSearch(interaction.guild.id, getByName(level), interaction.member.id);
                const embed2 = new MessageEmbed();
                if(server.info.language === 'es') {
                    embed2.setTitle(`Safesearch puesto a: \`${level}\``);
                }
                if(server.info.language === 'en') {
                    embed2.setTitle(`Safesearch set to: \`${level}\``);
                }
                embed2.setTimestamp();
                embed2.setColor("RANDOM");
                const msg2 = await interaction.channel.send({
                    embeds: [embed2]
                });
                messageDelete(msg2, interaction.member.id);
                break;

            case 'reset':
                Mysql.setSafeSearch(interaction.guild.id, config.default.safesearch, interaction.member.id);
                const embed3 = new MessageEmbed();
                if(server.info.language === 'es') {
                    embed3.setTitle(`Safesearch resetado a: \`${getByLevel(config.default.safesearch)}\``);
                }
                if(server.info.language === 'en') {
                    embed3.setTitle(`Safesearch reset to: \`${getByLevel(config.default.safesearch)}\``);
                }
                embed3.setTimestamp();
                embed3.setColor("RANDOM");
                const msg3 = await interaction.channel.send({
                    embeds: [embed3]
                });
                messageDelete(msg3, interaction.member.id);
                break;

            default:
                const embed = new MessageEmbed();
                if(server.info.language === 'es') {
                    embed.setTitle(`El nivel de safesarch esta en: \`${getByLevel(server.safesearch.safesearch)}\``);
                }
                if(server.info.language === 'en') {
                    embed.setTitle(`Safesearch level is: \`${getByLevel(server.safesearch.safesearch)}\``);
                }
                embed.setTimestamp();
                embed.setColor("RANDOM");
                const msg = await interaction.channel.send({
                    embeds: [embed]
                });
                messageDelete(msg, interaction.member.id);
                break;
        }
        return true;
    }
}


export default command;