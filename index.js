/**
 * @see https://github.com/adriabama06/no-soy-un-music-bot
 */

const { Client, Intents, MessageEmbed, ApplicationCommandData, ApplicationCommandOptionData, Message} = require('discord.js');

const config = require('./config.json');
const commandHandler = require('./commandHandler.js');
const MysqlIntermediator = require('./mysql.js');
const ServerManager = require('./servers');
const Mysql = new MysqlIntermediator();
const { messageDelete } = require('./util.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
});

/**
 * @type {Map<string, {name: string, description: string, args: ApplicationCommandOptionData[], alias: string[], run: () => void}>}
 */
var commands = new Map();
/**
 * @type {Map<string, {name: string, description: string, args: ApplicationCommandOptionData[], alias: string[], run: () => void}>}
 */
var alias = new Map();

/**
 * @type {Map<string, ServerManager}
 */
var servers = new Map();

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

    if(!Mysql.has(message.guild.id)) {
        await Mysql.add(message.guild.id, message.author.id);
    }

    const server = Mysql.get(message.guild.id);

    if(server.info.user === '%false%') {
        await Mysql.setInfo(message.guild.id, message.author.id);
    }

    var prefix = server.prefix.prefix;

    if(!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    console.log(`Message - ${message.author.username}#${message.author.discriminator} (${message.author.id}) : ${message.content}`);

    if(cmd == 'setup') {
        /**
         * @type {ApplicationCommandData[]}
         */
        var toset = [];
        for(const command of commands) {
            /**
             * @type {ApplicationCommandOptionData[]}
             */
            var opts = [];
            for(const op of command[1].args) {
                opts.push(op);
            }
            toset.push({name: command[0], description: command[1].description, options: opts});
        }
        for(const command of alias) {
            /**
             * @type {ApplicationCommandOptionData[]}
             */
            var opts = [];
            for(const op of command[1].args) {
                opts.push(op);
            }
            toset.push({name: command[0], description: command[1].description, options: opts});
        }
        await message.guild.commands.set(toset);
        const embed = new MessageEmbed();
        embed.setTitle(`slash commands añadidos!`);
        embed.setTimestamp();
        embed.setColor("GREEN");
        const msg = await message.channel.send({
            embeds: [embed]
        });
        messageDelete(msg, message.author.id);
        return;
    }

    if(!servers.has(message.guild.id)) {
        servers.set(message.guild.id, new ServerManager());
    }
    
    if(commands.has(cmd)) {
        commands.get(cmd).run({cmd, client, message, args, prefix, commands, alias, Mysql, config, server, servers});
        return;
    }
    if(alias.has(cmd)) {
        alias.get(cmd).run({cmd, client, message, args, prefix, commands, alias, Mysql, config, server, servers});
        return;
    }
});

client.on('guildCreate', async (guild) => {
    Mysql.add(guild.id);
    /**
     * @type {ApplicationCommandData[]}
     */
    var toset = [];
    for(const command of commands) {
        /**
         * @type {ApplicationCommandOptionData[]}
         */
        var opts = [];
        for(const op of command[1].args) {
            opts.push(op);
        }
        toset.push({name: command[1].name, description: command[1].description, options: opts});
    }
    for(const command of alias) {
        /**
         * @type {ApplicationCommandOptionData[]}
         */
        var opts = [];
        for(const op of command[1].args) {
            opts.push(op);
        }
        toset.push({name: command[1].name, description: command[1].description, options: opts});
    }
    await guild.commands.set(toset);
    /*await message.guild.commands.set([
		{
			name: 'play',
			description: 'Plays a song',
			options: [
				{
					name: 'song',
					type: 'STRING',
					description: 'The URL of the song to play',
					required: true,
				},
			],
		},
		{
			name: 'skip',
			description: 'Skip to the next song in the queue',
		},
		{
			name: 'queue',
			description: 'See the music queue',
		},
		{
			name: 'pause',
			description: 'Pauses the song that is currently playing',
		},
		{
			name: 'resume',
			description: 'Resume playback of the current song',
		},
		{
			name: 'leave',
			description: 'Leave the voice channel',
		},
	]);*/
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() || !interaction.guildId) {
        return;
    }
    if(!servers.has(interaction.guild.id)) {
        servers.set(interaction.guild.id, new ServerManager());
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
                await interaction.deleteReply();
            }
        }, 5000);
        await commands.get(cmd).run({cmd, client, message, args, prefix, commands, alias, Mysql, config, server, servers});
        did = true;
        if(interaction.replied === true && interaction.webhook) {
            await interaction.deleteReply();
        }
        return;
    }
    if(alias.has(cmd)) {
        await interaction.reply({content: 'Ejecutando commando...', ephemeral: false });
        var did = false;
        setTimeout(async () => {
            if(interaction.replied === true && did == false && interaction.webhook) {
                await interaction.deleteReply();
            }
        }, 5000);
        await alias.get(cmd).run({cmd, client, message, args, prefix, commands, alias, Mysql, config, server, servers});
        did = true;
        if(interaction.replied === true && interaction.webhook) {
            await interaction.deleteReply();
        }
        return;
    }
});

client.login(config.discord.token);