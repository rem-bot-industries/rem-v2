/**
 * Created by Julian on 17.03.2017.
 */
let AudioPlayer = require('../audio/player');
let SongResolver = require('../resolver/songResolver');
const winston = require('winston');
const shuffle = require('knuth-shuffle').knuthShuffle;
const utils = require('../../structures/utilities');
let Radio = require('../../structures/radio');
let SongTypes = require('../../structures/constants').SONG_TYPES;
class VoiceManager {
    constructor({mod}) {
        this.players = {};
        this.redis = mod.getMod('redis');
        this.sm = mod.getMod('sm');
        this.resolver = new SongResolver(this.redis);
    }

    async addRadioToQueue(msg, radio, immediate, next) {
        let connection = rem.voiceConnections.get(msg.channel.guild.id);
        let player = this.getPlayer(msg.channel.guild.id);
        if (!connection) {
            player = await this.join(msg);
        }
        if (!player) {
            let queue = await this.loadQueueFromCache(msg.channel.guild.id);
            player = await this.createPlayer(msg, connection, queue);
        }
        radio.queuedBy = utils.getMemberNameDiscrim(msg.member);
        player.addToQueue(radio, immediate, next);
        return Promise.resolve(radio);
    }

    async addToQueue(msg, immediate, next) {
        let connection = rem.voiceConnections.get(msg.channel.guild.id);
        let player = this.getPlayer(msg.channel.guild.id);
        if (!connection) {
            player = await this.join(msg);
        }
        if (!player) {
            let queue = await this.loadQueueFromCache(msg.channel.guild.id);
            player = await this.createPlayer(msg, connection, queue);
        }
        if (this.resolver.checkUrl(msg.content)) {
            let song = await this.resolver.resolve(msg.content);
            song.queuedBy = utils.getMemberNameDiscrim(msg.member);
            let queue = player.addToQueue(song, immediate, next);
            // console.log(queue);
            await this.writeQueueToCache(msg.channel.guild.id, queue);
            return song;
        }
        return this.resolver.search(msg.content);

    }

    async addPlaylistToQueue(msg) {
        let connection = rem.voiceConnections.get(msg.channel.guild.id);
        let player = this.getPlayer(msg.channel.guild.id);
        if (!connection) {
            player = await this.join(msg);
        }
        if (this.resolver.checkUrlPlaylist(msg.content)) {
            let playlist = await this.resolver.resolvePlaylist(msg.content);
            playlist.songs[0].queuedBy = `${msg.author.username}#${msg.author.discriminator}`;
            player.addToQueue(playlist.songs[0]);
            for (let i = 1; i < playlist.songs.length; i++) {
                playlist.songs[i].queuedBy = `${msg.author.username}#${msg.author.discriminator}`;
                player.pushQueue(playlist.songs[i]);
            }
            let queue = player.getQueue(msg.channel.guild.id);
            await this.writeQueueToCache(msg.channel.guild.id, queue);
            return Promise.resolve(playlist);
        } else {
            throw new TranslatableError({message: 'This Playlist is not supported!', t: 'apq.unsupported'});
        }
    }

    async forceSkip(msg, howMany) {
        let player = this.getPlayer(msg.channel.guild.id);
        if (typeof (player) !== 'undefined') {
            player.toggleRepeat('off');
            if (howMany) {
                let queue = player.getQueue(msg);
                let current = queue.songs.shift();
                if (howMany === 'all') {
                    queue.songs = [current];
                    player.setQueueSongs(queue.songs);
                    await this.writeQueueToCache(msg.channel.guild.id, queue);
                    await player.nextSong();
                    return Promise.resolve({t: 'skip.all'});
                } else {
                    let songsToSkip = 0;
                    try {
                        songsToSkip = parseInt(howMany);
                    } catch (e) {
                        throw new TranslatableError({
                            err: e,
                            t: 'generic.nan',
                            message: 'The passed argument could not be parsed as a number!'
                        });
                    }
                    if (isNaN(songsToSkip) || songsToSkip <= 0) {
                        throw new TranslatableError({
                            t: 'generic.nan',
                            message: 'The passed argument is 0 or smaller!'
                        });
                    }
                    if (songsToSkip > queue.songs.length) {
                        throw new TranslatableError({
                            t: 'generic.nan',
                            message: 'The passed argument is bigger than the songs in the queue!'
                        });
                    }
                    for (let i = 0; i < songsToSkip - 1; i++) {
                        queue.songs.shift();
                    }
                    queue.songs.unshift(current);
                    player.setQueueSongs(queue.songs);
                    await this.writeQueueToCache(msg.channel.guild.id, queue);
                    let song = await player.nextSong();
                    return Promise.resolve({t: 'skip.some', amount: songsToSkip});
                }
            } else {
                let song = await player.nextSong();
                if (song) {
                    return Promise.resolve({title: song.title, t: 'skip.success'});
                } else {
                    throw new TranslatableError({t: 'generic.no-song-playing'});
                }
            }
        } else {
            throw new TranslatableError({message: 'There was no player created yet.', t: 'generic.no-song-in-queue'});
        }
    }

    async queueRemove(msg, args) {
        let player = this.getPlayer(msg.channel.guild.id);
        if (typeof (player) !== 'undefined') {
            player.toggleRepeat('off');
            let queue = player.getQueue(msg);
            if (args === 'all') {
                let current = queue.songs.shift();
                let length = queue.songs.length;
                queue.songs = [current];
                player.setQueueSongs(queue.songs);
                await this.writeQueueToCache(msg.channel.guild.id, queue);
                return Promise.resolve({t: 'qra.success', number: length});
            } else {
                let range = args.split('-');
                let range2 = args.split(',');
                if (range.length > 1) {
                    let start = 0;
                    let end = 0;
                    try {
                        start = parseInt(range[0]);
                        end = parseInt(range[1]);
                    } catch (e) {
                        throw new TranslatableError({err: e, t: 'generic.nan'});
                    }
                    if (start >= 1 && start <= queue.songs.length && end >= 2 && end <= queue.songs.length) {
                        let counter = start > end ? end : start;
                        let secondCounter = start > end ? start : end;
                        for (let i = counter - 1; i < secondCounter; i++) {
                            queue.songs.splice(counter - 1, 1);
                        }
                        player.setQueueSongs(queue.songs);
                        await this.writeQueueToCache(msg.channel.guild.id, queue);
                        return Promise.resolve({t: 'qra.success', number: secondCounter + 1 - counter});
                    } else {
                        throw new TranslatableError({t: 'generic.nan'});
                    }
                } else if (range2.length > 1) {
                    let ids = [];
                    for (let i = 0; i < range2.length; i++) {
                        let id = 0;
                        try {
                            id = parseInt(range2[i]);
                        } catch (e) {
                            throw new TranslatableError({err: e, t: 'generic.nan'});
                        }
                        if (id <= queue.songs.length && id >= 1) {
                            ids.push(id);
                        } else {
                            throw new TranslatableError({err: e, t: 'generic.nan'});
                        }
                    }
                    ids.sort((a, b) => {
                        return b - a;
                    });
                    for (let i = 0; i < ids.length; i++) {
                        queue.songs.splice(ids[i] - 1, 1);
                    }
                    return ({t: 'qra.success', number: ids.length});
                } else {
                    let songIndex = 0;
                    try {
                        songIndex = parseInt(args);
                    } catch (e) {
                        throw new TranslatableError({err: e, t: 'generic.nan'});
                    }
                    // console.log(songIndex);
                    // console.log(queue.songs.length);
                    if (isNaN(songIndex) || songIndex <= 1 || songIndex > queue.songs.length) {
                        // console.log(songIndex);
                        throw new TranslatableError({t: 'generic.nan'});
                    }
                    let songToSkip = queue.songs[songIndex - 1];
                    if (songIndex > -1) {
                        queue.songs.splice(songIndex - 1, 1);
                    }
                    player.setQueueSongs(queue.songs);
                    await this.writeQueueToCache(msg.channel.guild.id, queue);
                    return Promise.resolve({t: 'qra.removed', title: songToSkip.title});
                }
            }
        } else {
            throw new TranslatableError({t: 'generic.no-song-in-queue'});
        }
    }

    async join(msg) {
        if (msg.channel.guild) {
            let connection = rem.voiceConnections.get(msg.channel.guild.id);
            if (!connection) {
                if (!msg.member.voiceState.channelID) {
                    throw new TranslatableError({
                        message: 'The user issuing the command is not in a voicechannel.',
                        t: 'joinVoice.no-voice'
                    });
                }
                try {
                    connection = await rem.joinVoiceChannel(msg.member.voiceState.channelID);
                    connection.once('error', (err) => {
                        console.error(err);
                    });
                    let queue = await this.loadQueueFromCache(msg.channel.guild.id);
                    let player = this.createPlayer(msg, connection, queue);
                    return Promise.resolve(player);
                } catch (e) {
                    winston.error(e);
                    throw new TranslatableError({
                        message: 'Error while trying to join channel!',
                        t: 'joinVoice.error',
                        origError: e
                    });
                }

            } else {
                return this.getPlayer(msg.channel.guild.id);
            }
        }
    }

    repeat(msg, type) {
        let player = this.getPlayer(msg.channel.guild.id);
        if (typeof (player) !== 'undefined') {
            if (type) {
                return player.toggleRepeat(type);
            } else {
                return player.toggleRepeatSingle();
            }
        } else {
            return 'off';
        }
    }

    async leave(msg) {
        if (msg.channel.guild) {
            let player = this.getPlayer(msg.channel.guild.id);
            if (player) {
                await this.writeQueueToCache(msg.channel.guild.id, player.getQueue());
                player.setQueueSongs([]);
                player.endSong(true);
                clearInterval(player.syncInterval);
            }
            rem.voiceConnections.leave(msg.channel.guild.id);
            return Promise.resolve();
        }
    }

    async shuffle(msg) {
        let conn = rem.voiceConnections.get(msg.channel.guild.id);
        if (!conn) {
            throw new TranslatableError({message: 'Rem is not connected to a voice channel.', t: 'generic.no-voice'});
        }
        let player = this.getPlayer(msg.channel.guild.id);
        if (player) {
            let queue = player.getQueue();
            if (queue.songs.length < 3) {
                throw new TranslatableError({
                    message: 'There are not enough songs in the queue to shuffle it.',
                    t: 'shuffle.not-enough-shuffle'
                });
            }
            let currentSong = queue.songs.shift();
            let shuffledQueue = shuffle(queue.songs.splice(0));
            shuffledQueue.unshift(currentSong);
            player.setQueueSongs(shuffledQueue);
            queue.songs = shuffledQueue;
            await this.writeQueueToCache(msg.channel.guild.id, queue);
            return Promise.resolve({t: 'shuffle.success'});
        } else {
            throw new TranslatableError({err: 'There is no player object atm.', t: 'generic.no-voice'});
        }

    }

    async resume(msg) {
        let conn = rem.voiceConnections.get(msg.channel.guild.id);
        if (!conn) {
            throw new TranslatableError({message: 'Rem is not connected to a voice channel.', t: 'generic.no-voice'});
        }
        try {
            this.players[msg.channel.guild.id].resume();
            return Promise.resolve();
        } catch (e) {
            throw new TranslatableError({
                message: 'Something went wrong while resuming the stream!',
                origError: e,
                t: 'generic.error'
            });
        }
    }

    async pause(msg) {
        let conn = rem.voiceConnections.get(msg.channel.guild.id);
        if (!conn) {
            throw new TranslatableError({message: 'Rem is not connected to a voice channel.', t: 'generic.no-voice'});
        }
        try {
            this.players[msg.channel.guild.id].pause();
            return Promise.resolve();
        } catch (e) {
            throw new TranslatableError({
                message: 'Something went wrong while pausing the stream!',
                origError: e,
                t: 'generic.error'
            });
        }
    }

    createPlayer(msg, connection, queue) {
        let player = this.getPlayer(msg.channel.guild.id);
        if (typeof (player) !== 'undefined') {
            if (queue) {
                player.setQueue(queue);
            }
            player.updateConnection(connection);
            player.autoplay();
            player.syncInterval = setInterval(() => {
                this.writeQueueToCache(msg.channel.guild.id, player.getQueue()).catch()
            }, 30 * 1000);
            return player;
        } else {
            player = new AudioPlayer(msg, connection, queue);
            this.players[msg.channel.guild.id] = player;
            player.syncInterval = setInterval(() => {
                this.writeQueueToCache(msg.channel.guild.id, player.getQueue()).catch()
            }, 30 * 1000);
            return player;
        }
    }

    getVoiceConnections(playing) {
        //ABAL!!!!!!!!!!!!!!!
        if (playing) {
            // console.log(rem.voiceConnections.filter((vc) => vc.playing).length);
            return rem.voiceConnections.filter((vc) => vc.playing).length;
        }
        return rem.voiceConnections.size
    }

    async loadQueueFromCache(guildId) {
        let queue = await this.redis.getAsync(`queue_${guildId}`);
        try {
            queue = JSON.parse(queue);
            queue.songs = queue.songs.filter((s) => s !== undefined);
            queue.songs = queue.songs.map((song) => {
                if (song) {
                    if (song.type === SongTypes.radio) {
                        return new Radio(song.options);
                    } else {
                        return song;
                    }
                }
            });
            return queue;
        } catch (e) {

        }
        return Promise.resolve();
    }

    async writeQueueToCache(guildId, queue) {
        queue.songs = queue.songs.filter((s) => s !== undefined);
        queue.songs = queue.songs.map((song) => {
            if (song) {
                if (song.type === SongTypes.radio) {
                    try {
                        song.end()
                    } catch (e) {

                    }
                    return song;
                } else {
                    return song;
                }
            }
        });
        await this.redis.setAsync(`queue_${guildId}`, JSON.stringify(queue));
        return this.redis.expireAsync(`queue_${guildId}`, 60 * 60 * 4);
    }

    getPlayer(id) {
        return this.players[id];
    }

    async getQueue(id) {
        let player = this.getPlayer(id);
        if (typeof (player) !== 'undefined') {
            let queue = player.getQueue();
            if (queue.songs.length > 0) {
                return queue;
            } else {
                throw new TranslatableError({
                    t: 'generic.no-song-in-queue',
                    message: 'There are no songs in the queue!'
                });
            }
        } else {
            let queue = await this.loadQueueFromCache(id);
            if (!queue) {
                throw new TranslatableError({
                    t: 'generic.no-song-in-queue',
                    message: 'There are no songs in the queue!'
                });
            }
            queue.time = '-';
            return queue;
        }
    }
}
module.exports = {class: VoiceManager, deps: ['sm'], async: false, shortcode: 'vm'};