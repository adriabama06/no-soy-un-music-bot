/**
 * @see https://github.com/discordjs/voice
 * @see https://discordjs.guide/voice/
 */
const Discord = require('discord.js');
const DiscordAudio = require('@discordjs/voice');
const ytdl = require('ytdl-core');
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
        /**
         * @type {{volume: number, loop: boolean, skip: boolean}}
         */
        this.options = {
            volume: 100,
            loop: false,
            skip: false,
        }
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
        if(this.isdispatcher === true && this.dispatcher != undefined) {
            this.dispatcher.player.stop();
            this.dispatcher = undefined;
            this.isdispatcher = false;
        }
        if(this.isconnection === true && this.connection != undefined) {
            this.connection.destroy();
            this.connection = undefined;
            this.isconnection = false;
        }
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
        this.audioresource.audioPlayer?.stop();
        this.audioresource = undefined;
        this.isaudioresoruce = false;
        return;
    }
    async play() {
        if(!this.songs[0]) return;
        if(this.audioplayer === undefined) {
            this.createPlayer();
        }
        this.audioresource = DiscordAudio.createAudioResource(ytdl(this.songs[0].videoDetails.video_url, { filter: 'audioonly', quality: 'highestaudio' }), { inputType: DiscordAudio.StreamType.WebmOpus });
        this.isaudioresoruce = true;
        this.audioplayer.play(this.audioresource);
        this.isaudioplayer = true;
        if(this.isdispatcher === false) {
            this.dispatcher = this.connection.subscribe(this.audioplayer);
            this.isdispatcher = true;
        }
        this.audioresource.playStream.once('end', async (oldState, newState) => {
            if(!this.songs[0]) {
                return;
            }
            if(!this.songs[1]) {
                if(this.ischannel && this.options.loop === false) {
                    const embed = new Discord.MessageEmbed();
                    embed.setDescription(`Acaba de sonar la ultima cancion:
                    [${this.songs[0].videoDetails.title}](${this.songs[0].videoDetails.video_url})`);
                    embed.setTimestamp();
                    embed.setColor("RANDOM");
                    const msg = await this.channel.send({
                        embeds: [embed]
                    });
                    messageDelete(msg, undefined, 15000);
                    this.end();
                    this.songs = [];
                    this.channel = undefined;
                    this.ischannel = false;
                    return;
                }
            }
            const embed = new Discord.MessageEmbed();
            if(this.options.loop === true && this.options.skip === false) {
                embed.setDescription(`Modo repeticion activado! Volvera a sonar:
                [${this.songs[0].videoDetails.title}](${this.songs[0].videoDetails.video_url})`);
            } else {
                embed.setDescription(`${this.options.skip === true ? "Skip! - " : ""}Acaba de sonar:
                [${this.songs[0].videoDetails.title}](${this.songs[0].videoDetails.video_url})
                
                La siguiente es:
                [${this.songs[1].videoDetails.title}](${this.songs[1].videoDetails.video_url})`);
                this.options.skip = false;
                this.songs.shift();
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            const msg = await this.channel.send({
                embeds: [embed]
            });
            messageDelete(msg, undefined, 15000);
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
        this.ischannel = true;
        return true;
    }
    /**
     * Idk now not work
     * Someone can help me about volume?
     * @param {number} volume send 0% to 100%
     */
    setVolume(volume) {
        if(this.isaudioresoruce === false || this.audioresource === undefined) {
            return false;
        }
        this.audioresource.volume?.setVolume(volume / 100);
        //this.audioplayer.state.resource.volume?.setVolume(volume / 100);
        this.options.volume = volume;
        return true;
    }
}

module.exports = ServerManager;