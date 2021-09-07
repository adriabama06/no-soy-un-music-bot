const Discord = require('discord.js');
const DiscordAudio = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const path = require('path');

class ServerManager {
    constructor() {
        /**
         * @type {ytdl.videoInfo[]}
         */
        this.songs = [];
        /**
         * @type {DiscordAudio.PlayerSubscription}
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
        /**
         * @type {DiscordAudio.AudioResource}
         */
        this.audioresource;
        this.isaudioresoruce = false;
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
        this.isconnection = true;
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
        if(this.isconnection === false) {
            return;
        }
        this.connection.destroy();
        this.connection = undefined;
        this.isconnection = false;
        return;
    }
    createPlayer() {
        this.audioplayer = DiscordAudio.createAudioPlayer();
        return;
    }
    /**
     * @param {boolean} force 
     */
    endPlayer(force = false) {
        if(this.isaudioplayer === false && force === false) {
            return;
        }
        this.audioplayer.stop(force);
        this.audioplayer = undefined;
        this.isaudioplayer = false;
        return;
    }
    endAudioSource() {
        if(this.isaudioresoruce === false) {
            return;
        }
        this.audioresource.audioPlayer.stop();
        this.audioresource = undefined;
        this.isaudioresoruce = false;
        return;
    }
    play() {
        if(this.isaudioresoruce === true) {
            this.audioresource.audioPlayer.stop();
            this.audioresource = undefined;
            this.isaudioresoruce = false;
        }

        if(this.audioplayer === undefined) {
            this.createPlayer();
        }

        this.audioresource = DiscordAudio.createAudioResource(ytdl(this.songs[0].videoDetails.video_url));
        this.isaudioresoruce = true;
        this.audioplayer.play(this.audioresource);
        this.isaudioplayer = true;
        if(this.isdispatcher === false) {
            this.dispatcher = this.connection.subscribe(this.audioplayer);
            this.isdispatcher = true;
        }
        return;
    }
    pause() {
        this.dispatcher.player.pause(true);
        return;
    }
    unpause() {
        this.dispatcher.player.unpause();
        return;
    }
    end() {
        this.endPlayer();
        this.endAudioSource();
        this.endConnection();
        return;
    }
}

module.exports = ServerManager;