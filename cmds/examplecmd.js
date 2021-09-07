const Discord = require('discord.js');
const ServerManager = require('../servers.js');

module.exports = {
    name: "examplecmd",
    description: "HOLA ESTE ES UN COMANDO DE PRUEBA",
    example: "{prefix}examplecmd",
    alias: ["alias1", "alias2"],
    /**
     * @param {{client: Discord.Client, message: Discord.Message, args: string[], prefix: string, commands: Map<string, {name: string, description: string, alias: string[], run: () => void}>, alias: Map<string, {name: string, description: string, alias: string[], run: () => void}>, Mysql: MysqlIntermediator, server, servers: Map<string, ServerManager>}} param0
     */
    run: async ({message, args, prefix, servers}) => {
        await message.channel.send({ content: `Hola, tus argumentos son: ${args.length != 0 ? args.join(' - ') : 'no hay args :c'} y tu prefix es: ${prefix}` });
        return;
    }
}