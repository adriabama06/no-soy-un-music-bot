import { GuildMember, MessageEmbed } from 'discord.js';
import { CommandInterface } from '../interfaces';
import { messageDelete } from '../util';

const command: CommandInterface = {
    name: 'setlogchannel',
    info: {
        es: 'Pon donde se notificara de cambios en la musica',
        en: 'Set where to notify changes in the music'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: undefined,
    alias: ['slc', 'logchannel'],
    run: async ({interaction, DataBaseServer, music}): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        music.setLogChannel(interaction.channel);
        const embed = new MessageEmbed();
        if(DataBaseServer.info.language == 'es') {
            embed.setDescription(`Ahora cualquier cambio en la musica se notificara aqui`);
        }
        if(DataBaseServer.info.language == 'en') {
            embed.setDescription(`Now any change in the music will be notified here`);
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