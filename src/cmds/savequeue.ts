import { GuildMember, MessageEmbed } from 'discord.js';
import { CommandInterface, CommandRunInterface } from '../interfaces';
import { messageDelete } from '../util';

const command: CommandInterface = {
    name: 'savequeue',
    info: {
        es: 'Guarda la queue actual',
        en: 'Save currrent queue'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: undefined,
    alias: ["sq"],
    run: async ({interaction, server, Mysql, music}: CommandRunInterface): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        if(music.songs.length <= 0) {
            const embed = new MessageEmbed();
            if(server.info.language === 'es') {
                embed.setDescription(`Espera... Que? No hay ninguna canción en la queue? Entonces que quieres guardar?, si es un error avise al staff o ejecute \`/info\` ves al github y añade el error`);
            }
            if(server.info.language === 'en') {
                embed.setDescription(`Wait... What? There is no song in the queue? So what do you want to save?, if it is an error, notify the staff or execute \`/info\` go to github and add the error`);    
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id);
            return;
        }
        var parsed: string[] = await Mysql.UnParseQueue(music.songs);
        await Mysql.setQueue(interaction.guild.id, parsed, interaction.member.id);
        const embed = new MessageEmbed();
        if(server.info.language === 'es') {
            embed.setDescription(`Se guardo la queue ahora la puedes cargar cuando quieras con \`/loadqueue\`, ! por ahora solo se guardaran hasta ~48 canciones`);
        }
        if(server.info.language === 'en') {
            embed.setDescription(`The queue was saved now you can load it with \`/loadqueue\`, ! for now only 48 songs will be saved`);
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