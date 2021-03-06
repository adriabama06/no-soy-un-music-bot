import { GuildMember, MessageEmbed } from 'discord.js';
import config from '../config';
import { CommandInterface } from '../interfaces';
import { messageDelete } from '../util';

type options = 'set' | 'reset';
function checkOptions(object: string): object is options {
    return ['set', 'reset'].includes(object);
}
type levelsByName = 'none' | 'moderate' | 'strict';
var ableLevels: levelsByName[] = ['none', 'moderate', 'strict'];
function checkLevels(object: string): object is levelsByName {
    return ['none', 'moderate', 'strict'].includes(object);
}
type levelsByLevel = '0' | '1' | '2';
function getByName(name: levelsByName | string): levelsByLevel {
    switch (name) {
        case 'none':
            return '0';
        case 'moderate':
            return '1';
        case 'strict':
            return '2';
        default:
            return config.default.safesearch;
    }
}
function getByLevel(level: levelsByLevel | string): levelsByName {
    switch (level) {
        case '0':
            return 'none';
        case '1':
            return 'moderate';
        case '2':
            return 'strict';
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
                    {name: 'Ninguno', value: 'none'},
                    {name: 'Moderado', value: 'moderate'},
                    {name: 'Estricto', value: 'strict'}
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
                    {name: 'None', value: 'none'},
                    {name: 'Moderate', value: 'moderate'},
                    {name: 'Strict', value: 'strict'}
                ]
            }
        ]
    },
    alias: undefined,
    run: async ({interaction, DataBaseServer, DataBase}): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        var opt = interaction.options.getString('option');
        if(!opt || (typeof opt == 'string' && !checkOptions(opt))) {
            const embed = new MessageEmbed();
            if(DataBaseServer.info.language === 'es') {
                embed.setTitle(`El nivel de safesarch esta en: \`${getByLevel(DataBaseServer.safesearch.safesearch)}\``);
            }
            if(DataBaseServer.info.language === 'en') {
                embed.setTitle(`Safesearch level is: \`${getByLevel(DataBaseServer.safesearch.safesearch)}\``);
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
                    const embed = new MessageEmbed();
                    if(DataBaseServer.info.language === 'es') {
                        embed.setTitle(`Ponga un nivel: \`${ableLevels.join(', ')}\``);
                    }
                    if(DataBaseServer.info.language === 'en') {
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
                DataBase.setSafeSearch({
                    id: interaction.guild.id,
                    safesearch: getByName(level),
                    user: interaction.member.id
                });
                const embed2 = new MessageEmbed();
                if(DataBaseServer.info.language === 'es') {
                    embed2.setTitle(`Safesearch puesto a: \`${level}\``);
                }
                if(DataBaseServer.info.language === 'en') {
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
                DataBase.setSafeSearch({
                    id: interaction.guild.id,
                    safesearch: config.default.safesearch,
                    user: interaction.member.id
                });
                const embed3 = new MessageEmbed();
                if(DataBaseServer.info.language === 'es') {
                    embed3.setTitle(`Safesearch resetado a: \`${getByLevel(config.default.safesearch)}\``);
                }
                if(DataBaseServer.info.language === 'en') {
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
                if(DataBaseServer.info.language === 'es') {
                    embed.setTitle(`El nivel de safesarch esta en: \`${getByLevel(DataBaseServer.safesearch.safesearch)}\``);
                }
                if(DataBaseServer.info.language === 'en') {
                    embed.setTitle(`Safesearch level is: \`${getByLevel(DataBaseServer.safesearch.safesearch)}\``);
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