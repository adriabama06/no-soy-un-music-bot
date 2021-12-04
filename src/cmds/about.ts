import { GuildMember, MessageEmbed } from 'discord.js';
import { CommandInterface } from '../interfaces';
import { messageDelete } from '../util';
var github: string = 'https://github.com/adriabama06/no-soy-un-music-bot/';
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
    params: undefined,
    alias: ["bot"],
    run: async ({interaction, DataBaseServer}): Promise<boolean | void> => {
        if(!interaction.guild || !interaction.channel || !interaction.member) { // some one know about how pass an parameter with an assegurated guild? to don't do this
            return false;
        }
        if(!(interaction.member instanceof GuildMember)) {
            return false;
        }
        const embed = new MessageEmbed();
        embed.setURL(github);
        embed.setTimestamp();
        embed.setColor("RANDOM");
        embed.setThumbnail("https://avatars.githubusercontent.com/u/68083226?s=400&u=42b76105fcfa4210be4c51b8296212da8a310355&v=4");
        if(DataBaseServer.info.language == 'es') {
            embed.setTitle(`Informacion sobre el bot`);
            embed.setDescription(`Este bot esta echo por: adriabama06
            Todos los arhcivos sobre el bot estan en github: ${github} cualquiera puede descargar y usar el bot
            
            Librerias usadas:
            - [discord.js](https://github.com/discordjs/discord.js) - Para el bot de discord
            - [mysql](https://github.com/mysqljs/mysql) - Para el acceso a una Base de Datos [MariaDB](https://mariadb.org/)
            - [ytdl-core](https://github.com/fent/node-ytdl-core) - Para obtener la informacion de forma rapida de un video de [YouTube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
            - [ytdl-core-discord](https://github.com/amishshah/ytdl-core-discord) - Para tener la entrada de video en opus para evitar usar ffmpeg para que vaya más rapido \`no lo uso temporalmente por pruebas que estoy haciendo\``);
        }
        if(DataBaseServer.info.language == 'en') {
            embed.setTitle(`Infromation about the bot`);
            embed.setDescription(`This bot was made by: adriabama06
            All files are on github: ${github} any can donwload and use the bot
            
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