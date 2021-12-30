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
import { MessageEmbed, StageChannel, TextBasedChannels, VoiceChannel } from 'discord.js';
import ytdl, { videoInfo } from 'ytdl-core';
import ytldDiscord from 'ytdl-core-discord';
import { DataBaseInterface, ServerManagerOptionsInterface } from './interfaces';
import { messageDelete } from './util';

export class ServerManager {
    public songs: videoInfo[] = [];
    public dispatcher: PlayerSubscription | undefined;
    public connection: VoiceConnection | undefined;
    public audioplayer: AudioPlayer | undefined; // Protected becuase is not neccesary acces out there
    public audioresource: AudioResource<unknown> | undefined; // Protected becuase is not neccesary acces out there
    public channel: TextBasedChannels | undefined;
    public server: DataBaseInterface | undefined;
    public options: ServerManagerOptionsInterface = {
        volume: 100,
        loop: false,
        skip: false
    };
    constructor() { }
    public createConnection(channel: VoiceChannel | StageChannel): VoiceConnection {
        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        return this.connection;
    }
    public getConnection(guildId: string): VoiceConnection | undefined {
        return getVoiceConnection(guildId);
    }
    public endConnection(): boolean {
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
    public createPlayer(): AudioPlayer {
        this.audioplayer = createAudioPlayer();
        return this.audioplayer;
    }
    public endPlayer(force: boolean = false): boolean {
        if(!this.audioplayer) {
            return false;
        }
        this.audioplayer.stop(force);
        this.audioplayer = undefined;
        return true;
    }
    public endAudioSource(): boolean {
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
        this.audioresource = createAudioResource(await ytldDiscord(this.songs[0].videoDetails.video_url, { filter: 'audioonly', quality: 'lowest' /* quality lowest for fast play and minus bitrate */ }), { inputType: StreamType.Opus, inlineVolume: true });
        this.audioresource.audioPlayer?.on('error', async (err) => {
            console.log(err);
            if(this.channel) {
                var embed = new MessageEmbed();
                embed.setTitle('Error');
                embed.setDescription(`Unexpected error`);
                if(this.server) {
                    if(this.server.info.language == 'es') {
                        embed.setDescription(`Error inesperado, se reportor el error al desarollador, si existe una cancion despues de esta en la queue, se dejara de reproducir esta y se pasara a la siguiente, disculpe las molestias`);
                    }
                    if(this.server.info.language == 'en') {
                        embed.setDescription(`Unexpected error, the error has been reported to the developer, if there is a song after this in the queue, it will be skipped, sorry for the inconvenience`);
                    }
                }
                embed.setColor('RANDOM');
                await this.channel.send({ embeds: [embed] });
            }
            this.songs.shift();
            this.play();
        });
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
                    if(this.server) {
                        if(this.server.info.language == 'es') {
                            embed.setDescription(`Acaba de sonar la ultima cancion`);
                            if(this.songs[0]) {
                                embed.setDescription(`Acaba de sonar la ultima cancion:
                                [${this.songs[0].videoDetails.title}](${this.songs[0].videoDetails.video_url})`);
                            }
                        }
                        if(this.server.info.language == 'en') {
                            embed.setDescription(`The last song has just finished`);
                            if(this.songs[0]) {
                                embed.setDescription(`The last song has just finished:
                                [${this.songs[0].videoDetails.title}](${this.songs[0].videoDetails.video_url})`);
                            }
                        }
                    }
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
            if(this.server) {
                if(this.server.info.language == 'es') {
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
                }
                if(this.server.info.language == 'en') {
                    if(this.options.loop === true && this.options.skip === false) {
                        embed.setDescription(`Loop mode activated! Will play again:
                        [${this.songs[0].videoDetails.title}](${this.songs[0].videoDetails.video_url})`);
                    } else {
                        embed.setDescription(`${this.options.skip === true ? "Skip! - " : ""}Just played:
                        [${this.songs[0].videoDetails.title}](${this.songs[0].videoDetails.video_url})
                        
                        Next is:
                        [${this.songs[1].videoDetails.title}](${this.songs[1].videoDetails.video_url})`);
                        this.options.skip = false;
                        this.songs.shift();
                    }
                }
            }
            embed.setTimestamp();
            embed.setColor("RANDOM");
            if(this.channel) {
                const msg = await this.channel.send({
                    embeds: [embed]
                });
                messageDelete(msg, undefined, 15000);
            }
            await this.play();
            this.setVolume(this.options.volume);
        });
        return;
    }
    public pause(): boolean {
        if(!this.dispatcher) {
            return false;
        }
        this.dispatcher.player.pause(true);
        return true;
    }
    public unpause(): boolean {
        if(!this.dispatcher) {
            return false;
        }
        this.dispatcher.player.unpause();
        return true;
    }
    public end(): void {
        this.endPlayer();
        this.endAudioSource();
        this.endConnection();
        return;
    }
    public setLogChannel(channel: TextBasedChannels): void {
        this.channel = channel;
        return;
    }
    public setServer(server: DataBaseInterface): void {
        this.server = server;
        return;
    }
    /**
     * Idk now not work
     * Someone can help me about volume?
     * @param {number} volume send 0% to 100%
     */
    public setVolume(volume: number): boolean {
        if(!this.audioresource) {
            return false;
        }
        this.audioresource.volume?.setVolume(volume / 100);
        //this.audioplayer.state.resource.volume?.setVolume(volume / 100);
        this.options.volume = volume;
        return true;
    }
}