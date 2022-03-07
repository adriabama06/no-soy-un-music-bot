import { GuildMember, MessageEmbed } from 'discord.js';
import { CommandInterface, isLanguageType } from '../interfaces';
import { messageDelete } from '../util';

var aviableLanguages: string[] = ['es', 'en'];

const command: CommandInterface = {
    name: 'setlanguage',
    info: {
        es: 'Cambia el idioma del bot',
        en: 'Change the language of the bot',
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: {
        es: [
            {
                name: 'language',
                type: 'STRING',
                required: false,
                description: 'Idioma del bot'
            }
        ],
        en: [
            {
                name: 'language',
                type: 'STRING',
                required: false,
                description: 'Language of the bot'
            }
        ]
    },
    alias: ['language', 'lang'],
    run: async ({interaction, DataBase, DataBaseServer, music}): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        var languageSelected = interaction.options.getString('language');
        if(!languageSelected) {
            const embed = new MessageEmbed();
            if(DataBaseServer.info.language == 'es') {
                embed.setDescription(`Idiomas disponibles: \`${aviableLanguages.join(', ')}\``);
            }
            if(DataBaseServer.info.language == 'en') {
                embed.setDescription(`Available languages: \`${aviableLanguages.join(', ')}\``);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id, 15000);
            return;
        }
        if(!isLanguageType(languageSelected)) {
            const embed = new MessageEmbed();
            if(DataBaseServer.info.language == 'es') {
                embed.setDescription(`Lenguaje invalido o no disponible: \`${languageSelected}\``);
            }
            if(DataBaseServer.info.language == 'en') {
                embed.setDescription(`Invalid language or not available: \`${languageSelected}\``);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id, 15000);
            return;
        }
        await DataBase.setInfo({
            id: interaction.guild.id,
            language: languageSelected,
            user: interaction.member.user.id,
        });
        const embed = new MessageEmbed();
        if(DataBaseServer.info.language == 'es') {
            embed.setDescription(`El bot se puso en español`);
        }
        if(DataBaseServer.info.language == 'en') {
            embed.setDescription(`The bot is now in english`);
        }
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await interaction.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, interaction.member.id, 15000);
        return true;
    }
}


export default command;