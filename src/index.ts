import { ApplicationCommandData, ApplicationCommandOptionData, Client, Intents, Interaction } from 'discord.js';

import { CommandInterface, isLanguageType } from './interfaces';
import config from './config';
import { loadCommands } from './commandHandler';
import { ServerManager } from './servers';
import { MySql, QuickDB } from './database';


const client: Client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
});

var DataBase: MySql | QuickDB;

if(config.database == 'mysql') {
    if(!config.mysql) {
        if(config.default.language == 'es') {
            console.log('[Error] Error en config.ts, tienes puesto config.database en mysql pero no se encontro configuracion para mysql');
            
        } else {
            console.log('[Error] Bad config.ts config file, you set config.database to mysql but you dont have mysql config');
        }
        process.exit(1);
    }
    DataBase = new MySql(config.mysql, {
        SyncInterval: config.syncInterval
    });
}
if(config.database == 'quick.db') {
    DataBase = new QuickDB({
        SyncInterval: config.syncInterval
    });
}

var Commands: Map<string, CommandInterface> = new Map<string, CommandInterface>();
var Alias: Map<string, CommandInterface> = new Map<string, CommandInterface>();
var Servers: Map<string, ServerManager> = new Map<string, ServerManager>();

client.on('ready', async () => {
    client.user?.setStatus('invisible');
    loadCommands('cmds', Commands, Alias);
    console.log(`Bot listo como ${client.user?.username}#${client.user?.discriminator} (${client.user?.id})`);
    client.user?.setPresence({
        activities: [{ name: `-> /help, en ${client.guilds.cache.size} servidores`, type: 'LISTENING', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }],
        status: 'idle'
    });
    setInterval(async () => {
        client.user?.setPresence({
            activities: [{ name: `-> /help, en  ${client.guilds.cache.size} servidores`, type: 'LISTENING', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }],
            status: 'idle'
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
                        {name: 'Load the commands in English', value: 'en'}
                    ]
                }
            ]
        }]);
    }
});


/**
 * @see https://support-dev.discord.com/hc/en-us/articles/4404772028055-Message-Content-Access-Deprecation-for-Verified-Bots
 * @example
 * client.on('messageCreate', async (message) => {
 *  return console.log('Please read the article first');
 * });
 */
client.on('interactionCreate', async (interaction: Interaction) => {
    if(!interaction.isCommand() || !interaction.guild || !interaction.member) {
        return;
    }
    if(!Servers.has(interaction.guild?.id)) {
        Servers.set(interaction.guild.id, new ServerManager());
    }
    if(!DataBase.has(interaction.guild.id)) {
        await DataBase.add(interaction.guild.id, interaction.member.user.id);
    }

    var DataBaseServer = DataBase.get(interaction.guild.id);
    if(!DataBaseServer) {
        return;
    }
    var music = Servers.get(interaction.guild.id);
    if(!music) {
        return;
    }
    music.setServer(DataBaseServer);

    if(DataBaseServer.info.user === '%false%') {
        await DataBase.setInfo({
            id: interaction.guild.id,
            language: config.default.language,
            user: interaction.member.user.id,
        });
    }

    console.log(`Slash : ${interaction.member.user.username}#${interaction.member.user.discriminator} (${interaction.member.user.id}) : /${interaction.commandName}`);
    for(const v of interaction.options.data) {
        console.log(`${v.name}${v.value ? ` - ${v.value.toString()}` : ''}`);
    }
    
    if(interaction.commandName === 'setup') {
        var languageSelected = interaction.options.getString('language');
        if(!languageSelected) {
            return;
        }
        if(!isLanguageType(languageSelected)) {
            return;
        }
        await DataBase.setInfo({
            id: interaction.guild.id,
            language: languageSelected,
            user: interaction.member.user.id,
        });
        await interaction.reply({ 
            content: 'Loading commands...',
            ephemeral: false
        });
        var toset: ApplicationCommandData[] = [];
        for(const Command of Commands) {
            var description: string = "Undefined: description";
            if(languageSelected == 'es') {
                var description: string = "Descripcion no puesta";
            }
            if(languageSelected == 'en') {
                var description: string = "Description not set";
            }
            var opts: ApplicationCommandOptionData[] = [];
            if(Command[1].params) {
                var params = Command[1].params[languageSelected];
                if(params) {
                    opts = params;
                }
            }
            if(Command[1].info) {
                var des = Command[1].info[languageSelected];
                if(des) {
                    description = des;
                }
            }
            toset.push({
                name: Command[0],
                description: description,
                options: opts
            });
        }
        for(const Command of Alias) {
            var description: string = "Undefined: description";;
            if(languageSelected == 'es') {
                var description: string = "Descripcion no puesta";
            }
            if(languageSelected == 'en') {
                var description: string = "Description not set";
            }
            var opts: ApplicationCommandOptionData[] = [];
            if(Command[1].params) {
                var params = Command[1].params[languageSelected];
                if(params) {
                    opts = params;
                }
            }
            if(Command[1].info) {
                var des = Command[1].info[languageSelected];
                if(des) {
                    description = des;
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
        await interaction.reply({ content: `\`${interaction.member.user.username} > /${interaction.commandName}\``, ephemeral: false });
        await Commands.get(interaction.commandName)?.run({client, interaction, DataBase, Commands, Alias, Servers, DataBaseServer, music});
        setTimeout(() => {
            if(interaction.guild) {
                try {
                    interaction.deleteReply();
                } catch (err) { }
            }
        }, 2 * 60 * 1000);
        return;
    }
    if(Alias.has(interaction.commandName)) {
        await interaction.reply({ content: `\`${interaction.member.user.username} > /${interaction.commandName}\``, ephemeral: false });
        await Alias.get(interaction.commandName)?.run({client, interaction, DataBase, Commands, Alias, Servers, DataBaseServer, music});
        setTimeout(() => {
            if(interaction.guild) {
                try {
                    interaction.deleteReply();
                } catch (err) { }
            }
        }, 2 * 60 * 1000);
        return;
    }
});

client.login(config.discord.token);