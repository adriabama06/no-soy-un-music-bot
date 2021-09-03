const { Client, Intents} = require('discord.js');
const config = require('./config.json');
const commandHandler = require('./commandHandler.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
});

/**
 * @type {Map<string, {name: string, description: string, alias: string[], run: () => void}>}
 */
var commands = new Map();
/**
 * @type {Map<string, {name: string, description: string, alias: string[], run: () => void}>}
 */
var alias = new Map();

client.on('ready', async () => {
    commandHandler.loadCommands("cmds", commands, alias);
    console.log(`Bot listo como ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
});

client.on('messageCreate', async (message) => {
    if(
    !message.guild
    || message.author.bot == true
    ) {
        return;
    }
    var prefix = config.discord.defaultprefix;

    if(!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    console.log(`${message.author.username}#${message.author.discriminator} (${message.author.id}) : ${message.content}`);

    if(commands.has(cmd)) {
        commands.get(cmd).run({cmd, client, message, args, prefix, commands, alias});
    }
    if(alias.has(cmd)) {
        alias.get(cmd).run({cmd, client, message, args, prefix, commands, alias});
    }
});

client.login(config.discord.token);