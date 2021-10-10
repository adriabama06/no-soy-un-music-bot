/**
 * @see https://github.com/discordjs/voice
 * @see https://discordjs.guide/voice/
 */

import {
    PlayerSubscription,
    VoiceConnection,
    AudioPlayer,
    AudioResource,
    joinVoiceChannel,
    getVoiceConnection,
    createAudioPlayer,
    createAudioResource,
    StreamType,
    AudioPlayerState
} from '@discordjs/voice';
import { MessageEmbed, TextBasedChannels, VoiceChannel } from 'discord.js';
import ytdl, { videoInfo } from 'ytdl-core';
import { ServerManagerInterface, ServerManagerOptionsInterface } from './interfaces';
import { messageDelete } from './util';

export class ServerManager implements ServerManagerInterface {
    songs: videoInfo[] = [];
    dispatcher: PlayerSubscription | undefined;
    connection: VoiceConnection | undefined;
    audioplayer: AudioPlayer | undefined;
    audioresource: AudioResource<unknown> | undefined;
    channel: TextBasedChannels | undefined;
    options: ServerManagerOptionsInterface = {
        volume: 100,
        loop: false,
        skip: false
    };
    constructor() { }
    createConnection(channel: VoiceChannel): VoiceConnection {
        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        return this.connection;
    }
    getConnection(guildId: string): VoiceConnection | undefined {
        return getVoiceConnection(guildId);
    }
    endConnection(): boolean {
        if(!this.connection) {
            return false;
        }
        if(this.dispatcher) {
            this.dispatcher.player.stop();
            this.dispatcher = undefined;
        }
        if(this.connection) {
            this.connection.destroy();
            this.connection = undefined;
        }
        return true;
    }
    createPlayer(): AudioPlayer {
        this.audioplayer = createAudioPlayer();
        return this.audioplayer;
    }
    endPlayer(force: boolean = false): boolean {
        if(!this.audioplayer) {
            return false;
        }
        this.audioplayer.stop(force);
        this.audioplayer = undefined;
        return true;
    }
    endAudioSource(): boolean {
        if(!this.audioresource) {
            return false;
        }
        this.audioresource.audioPlayer?.stop();
        this.audioresource = undefined;
        return true;
    }
    async play(): Promise<void> {
        if(!this.songs[0]) return;
        if(!this.audioplayer) {
            this.createPlayer();
        }
        this.audioresource = createAudioResource(ytdl(this.songs[0].videoDetails.video_url, { filter: 'audioonly', quality: 'highestaudio' }), { inputType: StreamType.WebmOpus });
        this.audioplayer?.play(this.audioresource);
        if(!this.audioplayer) {
            return;
        }
        if(!this.dispatcher) {
            this.dispatcher = this.connection?.subscribe(this.audioplayer);
        }
        this.audioresource.playStream.once('end', async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
            if(!this.songs[0]) {
                return;
            }
            if(!this.songs[1]) {
                if(this.channel && this.options.loop === false) {
                    const embed = new MessageEmbed();
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
                    return;
                }
            }
            const embed = new MessageEmbed();
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
            if(this.channel) {
                const msg = await this.channel.send({
                    embeds: [embed]
                });
                messageDelete(msg, undefined, 15000);
            }
            this.play();
        });
        return;
    }
    pause(): boolean {
        if(!this.dispatcher) {
            return false;
        }
        this.dispatcher.player.pause(true);
        return true;
    }
    unpause(): boolean {
        if(!this.dispatcher) {
            return false;
        }
        this.dispatcher.player.unpause();
        return true;
    }
    end(): void {
        this.endPlayer();
        this.endAudioSource();
        this.endConnection();
        return;
    }
    setLogChannel(channel: TextBasedChannels): void {
        this.channel = channel;
        return;
    }
    /**
     * Idk now not work
     * Someone can help me about volume?
     * @param {number} volume send 0% to 100%
     */
    setVolume(volume: number): boolean {
        if(!this.audioresource) {
            return false;
        }
        this.audioresource.volume?.setVolume(volume / 100);
        //this.audioplayer.state.resource.volume?.setVolume(volume / 100);
        this.options.volume = volume;
        return true;
    }
}