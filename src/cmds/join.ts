import { GuildMember, MessageEmbed } from 'discord.js';

import { CommandInterface, CommandRunInterface } from '../interfaces';
import { messageDelete } from '../util';

const command: CommandInterface = {
    name: 'join',
    info: {
        es: 'Entra al canal de voz',
        en: 'Join to the vioce channel'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: undefined,
    alias: ["entra"],
    run: async ({interaction, server, music}: CommandRunInterface): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        if(!interaction.member.voice.channel) {
            const embed = new MessageEmbed();
            if(server.info.language === 'es') {
                embed.setDescription(`Nececitas estar en un canal de voz para que el bot se pueda unir`);
            }
            if(server.info.language === 'en') {
                embed.setDescription(`You need get in voice channel for the bot can be join`);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id);
            return;
        }
        if(music.connection) {
            const embed = new MessageEmbed();
            if(server.info.language === 'es') {
                embed.setDescription(`Ya estoy conectado, verifica los canales, si no estoy ejecuta: \`/leave\` si no se repara avise a un staff, o ejecute \`/info\` ves al github y añade el error`);
            }
            if(server.info.language === 'en') {
                embed.setDescription(`I'm connected, verify the channels, else execute: \`/leave\` or call to staff, or execute \`/info\` and at github add the error`);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id);
            return;
        }
        music.createConnection(interaction.member.voice.channel);
        const embed = new MessageEmbed();
        
        if(server.info.language === 'es') {
            embed.setDescription(`¡ Me acabo de conectar !`);
        }
        if(server.info.language === 'en') {
            embed.setDescription(`I just join !`);
        }
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await interaction.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, interaction.member.id);
        return true;
    }
}


export default command;