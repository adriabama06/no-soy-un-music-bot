import { Client, Intents, Interaction } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

import { CommandInterface } from './interfaces';
import config from './config';
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
}, {
    SyncInterval: 5 * 1000 * 60
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
    //const rest = new REST({ version: '9' }).setToken(config.discord.token);
    //if(client.user) {
    //    await rest.put(
    //        Routes.applicationCommands(client.user?.id),
    //        {
    //            body: {
    //                
    //            }
    //        },
    //    );
    //}
});

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand() || !interaction.guild?.id || !interaction.member) {
        return;
    }
    if(!Servers.has(interaction.guild?.id)) {
        Servers.set(interaction.guild.id, new ServerManager());
    }
    if(!Mysql.has(interaction.guild.id)) {
        await Mysql.add(interaction.guild.id, interaction.member.user.id);
    }

    var server = Mysql.get(interaction.guild.id);

    if(!server) {
        return;
    }

    if(server.info.user === '%false%') {
        await Mysql.setInfo(interaction.guild.id, interaction.member.user.id);
    }

    console.log(`Slash : ${interaction.member.user.username}#${interaction.member.user.discriminator} (${interaction.member.user.id}) : /${interaction.commandName} ${interaction.options.data.forEach(d => `${d.name} - ${d.value}`)}`);
    
    
    if(Commands.has(interaction.commandName)) {
        await interaction.reply({content: 'Ejecutando commando...', ephemeral: false });
        var did = false;
        setTimeout(async () => {
            if(interaction.replied === true && did == false && interaction.webhook) {
                try {
                    await interaction.deleteReply();
                } catch (err) { }
            }
        }, 5000);
        await Commands.get(interaction.commandName)?.run({client, interaction, Mysql, Commands, Alias, Servers});
        did = true;
        if(interaction.replied === true && interaction.webhook) {
            try {
                await interaction.deleteReply();
            } catch (err) { }
        }
        return;
    }
    if(Alias.has(interaction.commandName)) {
        await interaction.reply({content: 'Ejecutando commando...', ephemeral: false });
        var did = false;
        setTimeout(async () => {
            if(interaction.replied === true && did == false && interaction.webhook) {
                try {
                    await interaction.deleteReply();
                } catch (err) { }
            }
        }, 5000);
        await Alias.get(interaction.commandName)?.run({client, interaction, Mysql, Commands, Alias, Servers});
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