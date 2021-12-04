import { GuildMember, MessageEmbed } from 'discord.js';

import { CommandInterface } from '../interfaces';
import { messageDelete } from '../util';

const command: CommandInterface = {
    name: 'pause',
    info: {
        es: 'Pausa la musica',
        en: 'Pause the music'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: undefined,
    alias: ["pausa"],
    run: async ({interaction, DataBaseServer, music}): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        if(!interaction.member.voice.channel) {
            const embed = new MessageEmbed();
            if(DataBaseServer.info.language === 'es') {
                embed.setDescription(`No veo que estes en un canal de voz, evita molestar a los demas`);
            }
            if(DataBaseServer.info.language === 'en') {
                embed.setDescription(`I can't see you in a voice channel, avoid disturbing others`);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id);
            return;
        }
        if(!music.connection) {
            const embed = new MessageEmbed();
            if(DataBaseServer.info.language === 'es') {
                embed.setDescription(`No estoy conectado en ningun canal de voz, verifica los canales, prueba de ejecutar: \`/join\` si no se repara avise a un staff, o ejecute \`/info\` ves al github y añade el error`);
            }
            if(DataBaseServer.info.language === 'en') {
                embed.setDescription(`I'm not connected right now in a voice channel, try make join to voice: \`/join\` or call to staff, or execute \`/info\` and at github add the error`);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id);
            return;
        }
        music.pause();
        const embed = new MessageEmbed();
        
        if(DataBaseServer.info.language === 'es') {
            embed.setTitle(`Musica pausada`);
        }
        if(DataBaseServer.info.language === 'en') {
            // add here
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