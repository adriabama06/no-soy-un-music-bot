const Discord = require('discord.js');
const config = require('./config.json');
const commandHandler = require('./commandHandler.js');
const client = new Discord.Client();

/**
 * @type {Map<string, {}>}
 */
var commands = new Map();
/**
 * @type {Map<string, {}>}
 */
var alias = new Map();

client.on('ready', async () => {
    commandHandler.loadCommands("cmds", commands, alias);
    console.log(`Bot listo como ${client.user}#${client.user} (${client.user.id})`);
});

client.login(config.discord.token);