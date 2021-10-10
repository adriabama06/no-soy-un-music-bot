import { Client, Intents, Interaction } from 'discord.js';


import { CommandInterface } from './interfaces';
import config from './config.json';
import { loadCommands } from './commandHandler';
import { ServerManager } from './servers';
import { MysqlIntermediator } from './mysql';


const client: Client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
});
var Commands: Map<string, CommandInterface> = new Map<string, CommandInterface>();
var Alias: Map<string, CommandInterface> = new Map<string, CommandInterface>();
var Servers: Map<string, ServerManager> = new Map<string, ServerManager>();
var Mysql: MysqlIntermediator = new MysqlIntermediator({
    host: config.mysql.host,
    user: config.mysql.username,
    password: config.mysql.password,
    database: config.mysql.database
});

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

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand() || !interaction.guild?.id) {
        return;
    }
    if(!Servers.has(interaction.guild?.id)) {
        Servers.set(interaction.guild.id, new ServerManager());
    }
    if(!Mysql.has(interaction.guild.id)) {
        await Mysql.add(interaction.guild.id, interaction.member.id);
    }

    const server = Mysql.get(interaction.guild.id);

    if(server.info.user === '%false%') {
        await Mysql.setInfo(interaction.guild.id, interaction.member.id);
    }
    var prefix = server.prefix.prefix;
    var cmd = interaction.commandName;
    var args = [];
    var message = interaction;
    for(const data of interaction.options.data) {
        if(data.value != undefined) {
            args.push(data.value);
        }
    }
    console.log(`Slash : ${interaction.member.user.username}#${interaction.member.user.discriminator} (${interaction.member.id}) : /${interaction.commandName} ${args.join(" ")}`);
    if(commands.has(cmd)) {
        await interaction.reply({content: 'Ejecutando commando...', ephemeral: false });
        var did = false;
        setTimeout(async () => {
            if(interaction.replied === true && did == false && interaction.webhook) {
                try {
                    await interaction.deleteReply();
                } catch (err) { }
            }
        }, 5000);
        await commands.get(cmd).run({cmd, client, message, args, prefix, commands, alias, Mysql, config, server, servers});
        did = true;
        if(interaction.replied === true && interaction.webhook) {
            try {
                await interaction.deleteReply();
            } catch (err) { }
        }
        return;
    }
    if(alias.has(cmd)) {
        await interaction.reply({content: 'Ejecutando commando...', ephemeral: false });
        var did = false;
        setTimeout(async () => {
            if(interaction.replied === true && did == false && interaction.webhook) {
                try {
                    await interaction.deleteReply();
                } catch (err) { }
            }
        }, 5000);
        await alias.get(cmd).run({cmd, client, message, args, prefix, commands, alias, Mysql, config, server, servers});
        did = true;
        if(interaction.replied === true && interaction.webhook) {
            try {
                await interaction.deleteReply();
            } catch (err) { }
        }
        return;
    }
});

client.login(config.discord.token);