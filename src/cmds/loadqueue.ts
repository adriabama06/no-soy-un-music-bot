import { GuildMember, MessageEmbed } from 'discord.js';
import { CommandInterface } from '../interfaces';
import { messageDelete, ParseQueue } from '../util';
import { videoInfo } from 'ytdl-core';

function isVideoInfo(obj: any): obj is videoInfo {
    return obj.videoDetails != undefined;
}

const command: CommandInterface = {
    name: 'loadqueue',
    info: {
        es: 'Carga una queue guardada',
        en: 'Load an saved queue'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: undefined,
    alias: ["lq"],
    run: async ({interaction, DataBaseServer, music}): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        if(DataBaseServer.queues.queue.length <= 0) {
            const embed = new MessageEmbed();
            if(DataBaseServer.info.language === 'es') {
                embed.setDescription(`Espera... Que? No hay ninguna queue guardada? Entonces que quieres cargar?, si es un error avise al staff o ejecute \`/info\` ves al github y añade el error`);
            }
            if(DataBaseServer.info.language === 'en') {
                embed.setDescription(`Wait... What? There is no queue saved? So what do you want to load?, if it is an error, notify the staff or execute \`/info\` go to github and add the error`);
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await interaction.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, interaction.member.id);
            return;
        }
        if(typeof DataBaseServer.queues.queue == 'string') {
            var parsed = await ParseQueue(DataBaseServer.queues.queue);
            DataBaseServer.queues.queue = parsed;
        }
        music.songs.push(...DataBaseServer.queues.queue);
        const embed = new MessageEmbed();
        if(DataBaseServer.info.language === 'es') {
            embed.setDescription(`Se cargo la queue! Utiliza \`/savequeue\` para guardar una nueva queue, la cargada no se ha borrado si quieres puedes replazarla, ! por ahora solo se guardaran hasta ~48 canciones`);
        }
        if(DataBaseServer.info.language === 'en') {
            embed.setDescription(`Queue loaded! Use \`/savequeue\` to save a new queue, the loaded queue was not deleted if you want to replace it, ! for now only 48 songs are saved`);
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