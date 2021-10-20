import { GuildMember, MessageEmbed } from 'discord.js';

import { CommandInterface, CommandRunInterface } from '../interfaces';
import { messageDelete } from '../util';

const command: CommandInterface = {
    name: 'leave',
    info: {
        es: 'Abandona el canal de voz',
        en: 'Leave the voice channel'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: undefined,
    alias: ["exit"],
    run: async ({interaction, server, Servers}: CommandRunInterface): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        const Music = Servers.get(interaction.guild.id);
        if(!Music) {
            return false;
        }
        if(!interaction.member.voice.channel) {
            const embed = new MessageEmbed();
            if(server.info.language === 'es') {
                embed.setDescription(`No veo que estes en un canal de voz, evita molestar a los demas`);
            }
            if(server.info.language === 'en') {
                embed.setDescription(`I can't see you in a voice channel, avoid disturbing others`);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            await messageDelete(msg, interaction.member.id);
            return;
        }
        if(!Music?.connection) {
            const embed = new MessageEmbed();
            if(server.info.language === 'es') {
                embed.setDescription(`No estoy conectado en ningun canal de voz, verifica los canales, prueba de ejecutar: \`/join\` si no se repara avise a un staff, o ejecute \`/info\` ves al github y añade el error`);
            }
            if(server.info.language === 'en') {
                embed.setDescription(`I'm not connected right now in a voice channel, try make join to voice: \`/join\` or call to staff, or execute \`/info\` and at github add the error`);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            await messageDelete(msg, interaction.member.id);
            return;
        }
        Music.end();
        const embed = new MessageEmbed();
        
        if(server.info.language === 'es') {
            embed.setDescription(`¡ Adios !`);
        }
        if(server.info.language === 'en') {
            embed.setDescription(`Bye !`);
        }
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await interaction.channel.send({
            embeds: [embed]
        });
        await messageDelete(msg, interaction.member.id);
        return true;
    }
}


export default command;