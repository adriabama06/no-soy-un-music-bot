const Discord = require('discord.js');
const { messageDelete } = require('../util.js');
var github = "https://github.com/adriabama06/no-soy-un-music-bot/";
module.exports = {
    name: "about",
    description: "Toda la informacion sobre el bot",
    example: "{prefix}about",
    args: [],
    alias: ["sobre", "bot"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({message}) => {
        const embed = new Discord.MessageEmbed();
        embed.setTitle(`Informacion sobre el bot`);
        embed.setURL(github);
        embed.setDescription(`Este bot esta echo por: <@!571067222202646541>
        Todos los arhcivos sobre el bot estan en github: ${github} cualquiera puede descargar y usar el bot
        
        Librerias usadas:
        - [discord.js](https://github.com/discordjs/discord.js) - Para el bot de discord
        - [mysql](https://github.com/mysqljs/mysql) - Para el acceso a una Base de Datos [MariaDB](https://mariadb.org/)
        - [ytdl-core](https://github.com/fent/node-ytdl-core) - Para obtener la informacion de forma rapida de un video de [YouTube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
        - [ytdl-core-discord](https://github.com/amishshah/ytdl-core-discord) - Para tener la entrada de video en opus para evitar usar ffmpeg para que vaya más rapido \`no lo uso temporalmente por pruebas que estoy haciendo\``);
        embed.setThumbnail("https://avatars.githubusercontent.com/u/68083226?s=400&u=42b76105fcfa4210be4c51b8296212da8a310355&v=4");
        embed.setTimestamp();
        embed.setColor("RANDOM");
        const msg = await message.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, message.member.id);
        return;
    }
}