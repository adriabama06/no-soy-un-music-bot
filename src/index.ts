import { ApplicationCommandData, ApplicationCommandOptionData, Client, Intents, Interaction } from 'discord.js';

import { CommandInterface } from './interfaces';
import config from './config';
import { loadCommands } from './commandHandler';
import { ServerManager } from './servers';
import { MysqlIntermediator } from './mysql';
import command from './cmds/examplecmd';


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
        activities: [{ name: `-> ${config.default.prefix}help o /help, en ${client.guilds.cache.size} servidores`, type: 'PLAYING' }],
        status: 'online'
    });
    setInterval(async () => {
        client.user?.setPresence({
            activities: [{ name: `-> ${config.default.prefix}help o /help, en ${client.guilds.cache.size} servidores`, type: 'PLAYING' }],
            status: 'online'
        });
    }, 2 * 60 * 1000);
    if(client.user) {
        client.application?.commands.set([{
            name: 'setup',
            type: 'CHAT_INPUT',
            description: 'Set the language on this server',
            options: [
                {
                    name: 'language',
                    type: 'STRING',
                    required: true,
                    description: 'languages to set',
                    choices: [
                        {name: 'Carga los comandos en Español', value: 'es'},
                        {name: 'load the commands in English', value: 'en'}
                    ]
                }
            ]
        }]);
    }
});

client.on('interactionCreate', async (interaction: Interaction) => {
    if(!interaction.isCommand() || !interaction.guild?.id || !interaction.member) {
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
        await Mysql.setInfo(interaction.guild.id, config.default.language, interaction.member.user.id);
    }

    console.log(`Slash : ${interaction.member.user.username}#${interaction.member.user.discriminator} (${interaction.member.user.id}) : /${interaction.commandName}`);
    for(const v of interaction.options.data) {
        console.log(`${v.name}${v.value ? ` - ${v.value.toString()}` : ''}`);
    }
    console.log('\n');
    
    if(interaction.commandName === 'setup') {
        var languageSelected = interaction.options.getString('language');
        if(!languageSelected) {
            return;
        }
        Mysql.setInfo(interaction.guild.id, languageSelected, interaction.member.user.id);
        await interaction.reply({ 
            content: 'Loading commands...',
            ephemeral: false
        });
        var toset: ApplicationCommandData[] = [];
        for(const Command of Commands) {
            var description: string = "Descripcion no puesta";
            var opts: ApplicationCommandOptionData[] = [];
            if(Command[1].params) {
                if(languageSelected === 'es') {
                    var params = Command[1].params.es;
                    var des = Command[1].info?.es;
                    if(params) {
                        opts = params;
                    }
                    if(des) {
                        description = des;
                    }
                }
                if(languageSelected === 'en') {
                    var params = Command[1].params.en;
                    var des = Command[1].info?.en;
                    if(params) {
                        opts = params;
                    }
                    if(des) {
                        description = des;
                    }
                }
            }
            toset.push({
                name: Command[0],
                description: description,
                options: opts
            });
        }
        for(const Command of Alias) {
            var description: string = "Descripcion no puesta";
            var opts: ApplicationCommandOptionData[] = [];
            if(Command[1].params) {
                if(languageSelected === 'es') {
                    var params = Command[1].params.es;
                    var des = Command[1].info?.es;
                    if(params) {
                        opts = params;
                    }
                    if(des) {
                        description = des;
                    }
                }
                if(languageSelected === 'en') {
                    var params = Command[1].params.en;
                    var des = Command[1].info?.en;
                    if(params) {
                        opts = params;
                    }
                    if(des) {
                        description = des;
                    }
                }
            }
            
            toset.push({
                name: Command[0],
                description: description,
                options: opts
            });
        }
        await interaction.guild.commands.set(toset);
        if(languageSelected == 'es') {
            await interaction.editReply({ content: 'Comandos cargados' });
        }
        if(languageSelected == 'en') {
            await interaction.editReply({ content: 'Commands loaded' });
        }
    }
    
    if(Commands.has(interaction.commandName)) {
        if(server.info.language == 'es') {
            await interaction.reply({content: 'Ejecutando comando...', ephemeral: false });
        }
        if(server.info.language == 'en') {
            await interaction.reply({content: 'Running command...', ephemeral: false });
        }
        var did = false;
        setTimeout(async () => {
            if(interaction.replied === true && did == false && interaction.webhook && server) {
                try {
                    if(server.info.language == 'es') {
                        await interaction.editReply({ content: '¡Comando finalizado!' });
                    }
                    if(server.info.language == 'en') {
                        await interaction.editReply({ content: 'Command ended!' });
                    }
                } catch (err) { }
            }
        }, 5000);
        setTimeout(async () => {
            if(interaction.replied === true && did == false && interaction.webhook) {
                try {
                    await interaction.deleteReply();
                } catch (err) { }
            }
        }, 30000);
        await Commands.get(interaction.commandName)?.run({client, interaction, Mysql, Commands, Alias, Servers, server});
        did = true;
        if(interaction.replied === true && interaction.webhook) {
            try {
                if(server.info.language == 'es') {
                    await interaction.editReply({ content: '¡Comando finalizado!' });
                }
                if(server.info.language == 'en') {
                    await interaction.editReply({ content: 'Command ended!' });
                }
            } catch (err) { }
        }
        return;
    }
    if(Alias.has(interaction.commandName)) {
        if(server.info.language == 'es') {
            await interaction.reply({content: 'Ejecutando comando...', ephemeral: false });
        }
        if(server.info.language == 'en') {
            await interaction.reply({content: 'Running command...', ephemeral: false });
        }
        var did = false;
        setTimeout(async () => {
            if(interaction.replied === true && did == false && interaction.webhook && server) {
                try {
                    if(server.info.language == 'es') {
                        await interaction.editReply({ content: '¡Comando finalizado!' });
                    }
                    if(server.info.language == 'en') {
                        await interaction.editReply({ content: 'Command ended!' });
                    }
                } catch (err) { }
            }
        }, 5000);
        setTimeout(async () => {
            if(interaction.replied === true && did == false && interaction.webhook) {
                try {
                    await interaction.deleteReply();
                } catch (err) { }
            }
        }, 30000);
        await Alias.get(interaction.commandName)?.run({client, interaction, Mysql, Commands, Alias, Servers, server});
        did = true;
        if(interaction.replied === true && interaction.webhook) {
            try {
                if(server.info.language == 'es') {
                    await interaction.editReply({ content: '¡Comando finalizado!' });
                }
                if(server.info.language == 'en') {
                    await interaction.editReply({ content: 'Command ended!' });
                }
            } catch (err) { }
        }
        return;
    }
});

client.login(config.discord.token);