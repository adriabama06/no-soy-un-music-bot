const Discord = require('discord.js');
const DiscordAudio = require('@discordjs/voice');
const ytdl = require('ytdl-core');

class ServerManager {
    constructor() {
        /**
         * @type {ytdl.videoInfo}
         */
        this.songs = [];
        /**
         * @type {Discord}
         */
        this.dispatcher;
        this.isdispatcher = false;
        /**
         * @type {DiscordAudio.VoiceConnection}
         */
        this.connection;
        this.isconnection = false;
        /**
         * @type {DiscordAudio.AudioPlayer}
         */
        this.audioplayer;
        this.isaudioplayer = false;

    }

    /**
     * @param {Discord.VoiceChannel} channel
     * @return {DiscordAudio.VoiceConnection}
     */
    createConnection(channel) {
        this.connection = DiscordAudio.joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        return this.connection;
    }
    /**
     * @param {Discord.VoiceChannel | Discord.Guild | Discord.GuildChannel | string} channel
     * @return {DiscordAudio.VoiceConnection}
     */
    getConnection(channel) {
        var guildId;
        if(typeof guildId === 'string') {
            guildId = channel;
        }
        if(channel instanceof Discord.VoiceChannel) {
            guildId = channel.guild.id;
        }
        if(channel instanceof Discord.Guild) {
            guildId = channel.id;
        }
        if(channel instanceof Discord.GuildChannel) {
            guildId = channel.guild.id;
        }
        this.connection = DiscordAudio.getVoiceConnection(guildId);
        return this.connection;
    }
    endConnection() {
        this.connection.destroy();
    }
    createPlayer() {
        this.audioplayer = DiscordAudio.createAudioPlayer();
    }
    /**
     * @param {boolean} force 
     */
    endPlayer(force = false) {
        this.audioplayer.stop(force);
    }
    /**
     * @param {DiscordAudio.VoiceConnection} connection 
     */
    play(connection) {
        if(this.isaudioplayer === false) {
            this.audioplayer.play(this.songs[0]);
        }
    }
}

module.exports = ServerManager;