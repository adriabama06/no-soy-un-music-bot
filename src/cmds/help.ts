import { GuildMember, MessageEmbed } from 'discord.js';
import { CommandInterface, CommandRunInterface } from '../interfaces';
import { messageDelete } from '../util';

const command: CommandInterface = {
    name: 'about',
    info: {
        es: 'Muestra informacion sobre el bot',
        en: 'Show the bot information'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: {
        es: [
            {
                name: 'user',
                type: 'USER',
                required: false,
                description: 'a quien quieres probar'
            }
        ],
        en: [
            {
                name: 'user',
                type: 'USER',
                required: false,
                description: 'who we like test'
            }
        ]
    },
    alias: ["info", "bot"],
    run: async ({interaction, server, Commands}: CommandRunInterface): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        var texts: string[] = [];
        for(const command of Commands) {
            var name: string = "";

            var pref_bdesc: string = "";
            var bdesc: string = "";
            
            var pref_ldesc: string = "";
            var ldesc: string = "";

            var pref_alias: string = "";
            var alias: string = "";
            if(server.info.language == 'es') {
                name = command[1].name ? command[1].name : 'Nombre no puesto';
                pref_bdesc = 'Descripcion basica';
                if(command[1].info) {
                    var i = command[1].info[server.info.language];
                    if(i) {
                        bdesc = i;
                    }
                }
                if(bdesc === '') {
                    bdesc = 'Descripcion basica no puesta';
                }

                pref_ldesc = 'Descripcion completa';
                if(command[1].longinfo) {
                    var i = command[1].longinfo[server.info.language];
                    if(i) {
                        bdesc = i;
                    }
                }
                if(bdesc === '') {
                    bdesc = 'Descripcion completa no puesta';
                }
                pref_alias = 'Alias';
                if(command[1].alias) {
                    alias = command[1].alias.join(' | ');
                }
            }
            texts.push(`
            
            **/${name}**
            **${pref_bdesc}**: ${bdesc}
            **${pref_ldesc}**: ${ldesc}
            **${pref_alias}**: ${alias}`);
        }
        const embed = new MessageEmbed();
        embed.setTimestamp();
        embed.setColor("RANDOM");
        embed.setThumbnail("https://avatars.githubusercontent.com/u/68083226?s=400&u=42b76105fcfa4210be4c51b8296212da8a310355&v=4");
        if(server.info.language == 'es') {
            embed.setTitle(`Informacion sobre el bot`);
            embed.setDescription(`Este bot esta echo por: adriabama06
            Todos los arhcivos sobre el bot estan en github: cualquiera puede descargar y usar el bot
            
            Librerias usadas:
            - [discord.js](https://github.com/discordjs/discord.js) - Para el bot de discord
            - [mysql](https://github.com/mysqljs/mysql) - Para el acceso a una Base de Datos [MariaDB](https://mariadb.org/)
            - [ytdl-core](https://github.com/fent/node-ytdl-core) - Para obtener la informacion de forma rapida de un video de [YouTube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
            - [ytdl-core-discord](https://github.com/amishshah/ytdl-core-discord) - Para tener la entrada de video en opus para evitar usar ffmpeg para que vaya más rapido \`no lo uso temporalmente por pruebas que estoy haciendo\``);
        }
        if(server.info.language == 'en') {
            embed.setTitle(`Infromation about the bot`);
            embed.setDescription(`This bot was made by: adriabama06
            All files are on github: any can donwload and use the bot
            
            Libs used:
            - [discord.js](https://github.com/discordjs/discord.js) - For the discord bot
            - [mysql](https://github.com/mysqljs/mysql) - For the acces of database [MariaDB](https://mariadb.org/)
            - [ytdl-core](https://github.com/fent/node-ytdl-core) - For get youtube information [YouTube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
            - [ytdl-core-discord](https://github.com/amishshah/ytdl-core-discord) - Get directly opus codec for auido \`no lo uso temporalmente por pruebas que estoy haciendo\``);
        }

        const msg = await interaction.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, interaction.member.id);
        return true;
    }
}


export default command;