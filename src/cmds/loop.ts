import { GuildMember, MessageEmbed } from 'discord.js';
import { CommandInterface } from '../interfaces';
import { messageDelete } from '../util';

const command: CommandInterface = {
    name: 'loop',
    info: {
        es: 'Haz que la cancion suene en bucle',
        en: 'Make the song sound in loop'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: undefined,
    alias: ['repeticion'],
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
                embed.setDescription(`Nececitas estar en un canal, evita molestar a los demas`);
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
        const embed = new MessageEmbed();
        embed.setTimestamp();
        embed.setColor("RANDOM");
        if(music.options.loop === false) {
            music.options.loop = true;
            if(DataBaseServer.info.language === 'es') {
                embed.setTitle(`Se habilito el modo repeticion`);
            }
            if(DataBaseServer.info.language === 'en') {
                embed.setTitle(`Loop mode was enabled`);
            }
            
        } else {
            music.options.loop = false;
            if(DataBaseServer.info.language === 'es') {
                embed.setTitle(`Se deshabilito el modo repeticion`);
            }
            if(DataBaseServer.info.language === 'en') {
                embed.setTitle(`Loop mode was disabled`);
            }
        }
        const msg = await interaction.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, interaction.member.id);
        return true;
    }
}


export default command;