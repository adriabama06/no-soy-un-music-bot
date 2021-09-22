/**
 * @see https://github.com/discordjs/voice
 * @see https://discordjs.guide/voice/
 */
const Discord = require('discord.js');
const DiscordAudio = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
const path = require('path');
const { messageDelete } = require('./util.js');

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
        /**
         * @type {Discord.TextBasedChannels}
         */
        this.channel;
        this.ischannel = false;
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
        this.dispatcher.player.stop();
        this.dispatcher = undefined;
        this.isdispatcher = false;
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
    async play() {
        if(this.audioplayer === undefined) {
            this.createPlayer();
        }
        this.audioresource = DiscordAudio.createAudioResource(await ytdl(this.songs[0].videoDetails.video_url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 50 }), { inputType: DiscordAudio.StreamType.Opus});
        this.isaudioresoruce = true;
        this.audioplayer.play(this.audioresource);
        this.isaudioplayer = true;
        if(this.isdispatcher === false) {
            this.dispatcher = this.connection.subscribe(this.audioplayer);
            this.isdispatcher = true;
        }
        this.audioresource.playStream.once('end', async (oldState, newState) => {
            if(!this.songs[1]) {
                if(this.ischannel) {
                    const embed = new Discord.MessageEmbed();
                    embed.setDescription(`Acaba de sonar la ultima cancion:
                    [${this.songs[0].videoDetails.title}](${this.songs[0].videoDetails.video_url})`);
                    embed.setTimestamp();
                    embed.setColor("RANDOM");
                    const msg = await this.channel.send({
                        embeds: [embed]
                    });
                    messageDelete(msg, undefined, 15000);
                }
                this.end();
                this.songs = [];
                return;
            }
            const embed = new Discord.MessageEmbed();
            embed.setDescription(`Acaba de sonar:
            [${this.songs[0].videoDetails.title}](${this.songs[0].videoDetails.video_url})
            
            La siguiente es:
            [${this.songs[1].videoDetails.title}](${this.songs[1].videoDetails.video_url})`);
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await this.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, undefined, 15000);
            this.songs.shift();
            this.play();
        });
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
    /**
     * @param {Discord.TextBasedChannels | Discord.TextChannel | Discord.GuildChannel} channel
     */
    setLogChannel(channel) {
        this.channel = channel;
        return;
    }
}

module.exports = ServerManager;