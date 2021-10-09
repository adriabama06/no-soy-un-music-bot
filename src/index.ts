import { Client, Intents } from 'discord.js';


import { CommandInterface } from './interfaces';
import config from './config.json';
import { loadCommands } from './commandHandler';


const client: Client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
});
var Commands: Map<string, CommandInterface> = new Map<string, CommandInterface>();
var Alias: Map<string, CommandInterface> = new Map<string, CommandInterface>();


client.on('ready', async () => {
    client.user?.setStatus('invisible');
    loadCommands('cmds', Commands, Alias);
    console.log(`Bot listo como ${client.user?.username}#${client.user?.discriminator} (${client.user?.id})`);
    client.user?.setPresence({
        activities: [{ name: `-> ${config.discord.defaultprefix}help o /help, en ${client.guilds.cache.size} servidores`, type: 'PLAYING' }],
        status: 'online'
    });
    setInterval(async () => {
        client.user?.setPresence({
            activities: [{ name: `-> ${config.discord.defaultprefix}help o /help, en ${client.guilds.cache.size} servidores`, type: 'PLAYING' }],
            status: 'online'
        });
    }, 2 * 60 * 1000);
});


client.login(config.discord.token);