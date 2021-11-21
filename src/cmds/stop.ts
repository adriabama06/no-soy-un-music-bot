import { GuildMember, MessageEmbed } from 'discord.js';
import { CommandInterface, CommandRunInterface } from '../interfaces';
import { messageDelete } from '../util';

const command: CommandInterface = {
    name: 'stop',
    info: {
        es: 'Limpia la queue y se desconecta',
        en: 'Clear the queue and disconnect'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: {
        es: [
            {
                name: 'savequeue',
                type: 'BOOLEAN',
                required: false,
                description: 'Quieres guardar la queue antes de borrarla'
            }
        ],
        en: [
            {
                name: 'savequeue',
                type: 'BOOLEAN',
                required: false,
                description: 'Do you want to save the queue before deleting it'
            }
        ]
    },
    alias: ['end'],
    run: async ({interaction, server, music, Mysql}: CommandRunInterface): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
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
            messageDelete(msg, interaction.member.id);
            return;
        }
        if(!music.connection) {
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
            messageDelete(msg, interaction.member.id);
            return;
        }
        music.end();
        var savequeue = interaction.options.getBoolean('savequeue');
        if(savequeue != null && savequeue == true) {
            var parsed: string[] = await Mysql.UnParseQueue(music.songs);
            await Mysql.setQueue(interaction.guild.id, parsed, interaction.member.id);
        }
        music.songs = [];
        const embed = new MessageEmbed();
        if(server.info.language == 'es') {
            embed.setTitle(`Se finalizo la musica y se borro la queue`);
        }
        if(server.info.language == 'en') {
            embed.setTitle(`Music ended and queue deleted`);
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