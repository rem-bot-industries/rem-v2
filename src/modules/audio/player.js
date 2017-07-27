/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let EventEmitter = require('eventemitter3');
let shortid = require('shortid');
let winston = require('winston');
let path = require('path');
let fs = require('fs');
let SongTypes = require('../../structures/constants').SONG_TYPES;
let ytr = require('../resolver/youtubeResolver');
let icy = require('icy');
const WolkeStream = require('./WolkeStream');
let ytdl = require('ytdl-core');
// let BufferedStream = require("buffered2").BufferedStream;
/**
 * The audio player
 * @extends EventEmitter
 *
 */
class Player extends EventEmitter {
    /**
     * Create the audio player
     * @param {Object} msg - the message
     * @param {Object} connection the voice connection
     * @param {Object} queue The queue
     */
    constructor(msg, connection, queue) {
        super();
        this.setMaxListeners(20);
        this.msg = msg;
        this.queue = queue ? queue : {id: msg.channel.guild.id, repeat: 'off', voteskips: [], songs: [], time: ''};
        this.connection = connection;
        this.song = null;
        this.channel = '';
        this.started = false;
        this.autoLeaveTimeout = null;
        this.autoplay();
    }

    /**
     * Plays a Song
     * @param {Song} Song - the song to play
     */
    async play(Song) {
        clearTimeout(this.autoLeaveTimeout);
        if ((this.connection && this.connection.ready || this.connection && rem.options.crystal) && Song) {
            let link;
            let options = {};
            // console.log(Song.streamUrl);
            switch (Song.type) {
                case SongTypes.youtube: {
                    options.resolve = true;
                    if (Song.isOpus) {
                        if (!remConfig.use_crystal) {
                            try {
                                link = new WolkeStream(Song.streamUrl);
                            } catch (e) {
                                console.error(e);
                                return this.nextSong(Song);
                            }
                        } else {
                            link = Song.url;
                        }
                        options.format = 'webm';
                        options.frameDuration = 20;
                    } else {
                        if (remConfig.use_crystal) {
                            link = Song.url;
                        } else {
                            link = Song.streamUrl;
                        }
                        options.inputArgs = ["-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "2"];
                        // link = this.processStream(secondStream);
                    }
                    break;
                }
                case SongTypes.youtube_live: {
                    options.resolve = true;
                    if (remConfig.use_crystal) {
                        link = Song.url;
                    } else {
                        link = Song.streamUrl;
                    }
                    options.inputArgs = ["-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "2"];
                    break;
                }
                case SongTypes.soundcloud: {
                    if (Song.streamUrl) {
                        link = Song.streamUrl;
                        options.inputArgs = ["-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "2"];
                    } else {
                        return this.nextSong();
                    }
                    break;
                }
                case SongTypes.osu: {
                    if (!rem.options.crystal) {
                        try {
                            link = fs.createReadStream(Song.url);
                        } catch (e) {
                            this.emit('error', e);
                        }
                        link.on('error', (err) => {
                            winston.error(err);
                        });
                    } else {
                        return this.nextSong();
                    }
                    break;
                }
                case SongTypes.twitch: {
                    link = Song.streamUrl;
                    options.inputArgs = ["-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "2"];
                    break;
                }
                case SongTypes.radio: {
                    try {
                        Song.connect();
                    } catch (e) {
                        console.error(e);
                    }
                    link = Song.streamUrl;
                    options.inputArgs = ["-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "2"];
                    break;
                }
                default:
                    return this.nextSong();
                    break;
            }
            this.connection.once('end', () => {
                winston.info("File ended!");
                // console.log(this.connection.listeners('end'));
                this.connection.removeAllListeners();
                // console.log(this.connection.listeners('end'));
                this.nextSong(Song);
            });
            this.connection.once('error', (err) => {
                winston.error(`Connection error: ${err}`);
                this.toggleRepeat('off');
                this.nextSong(Song);
            });
            this.connection.play(link, options);
            this.announce(Song);
        }
        else {
            setTimeout(() => {
                // console.log('TIMEOUT!');
                this.play(Song);
            }, 1000);
        }
    }

    /**
     * Pauses the song
     */
    pause() {
        try {
            this.connection.pause();
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Resumes the song
     */
    resume() {
        try {
            this.connection.resume();
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Adds a song to the queue
     * @param Song - the song that should be added to the queue
     * @param immediate - if the song should be played immediately
     * @param next - if the song should be enqueued to the 2nd position
     */
    addToQueue(Song, immediate, next) {
        if (!Song || Song === undefined) {
            return this.queue;
        }
        if (this.queue.repeat !== 'queue') {
            this.toggleRepeat('off');
        }
        if (immediate) {
            this.queue.songs.unshift(Song);
            if (this.started) {
                this.endSong();
            }
            this.play(Song);
            this.started = true;
        } else if (next) {
            let current;
            if (this.queue.songs.length > 0) {
                current = this.queue.songs.shift();
            }
            this.queue.songs.unshift(Song);
            if (typeof (current) === 'undefined' || !current) {
                if (this.started) {
                    this.endSong();
                }
                this.play(Song);
                this.started = true;
                immediate = true;
            } else {
                this.queue.songs.unshift(current);
            }
        } else {
            this.queue.songs.push(Song);
        }
        // console.log(this.started);
        // console.log(Song);
        if (this.queue.songs.length === 1 && !immediate || this.queue.songs.length > 0 && !this.started) {
            this.started = true;
            this.play(this.queue.songs[0]);
        }
        return this.queue;
    }

    autoplay() {
        // console.log(this.queue);
        if (this.queue.songs.length > 0 && !this.started) {
            this.started = true;
            this.play(this.queue.songs[0]);
        }
    }

    /**
     * Plays the next song, can be used to skip songs
     * @param Song - the song that is skipped (optional)
     */
    async nextSong(Song) {
        if (this.queue.songs.length > 0) {
            if (typeof (Song) !== 'undefined') {
                if (this.queue.songs[0] && Song.qid === this.queue.songs[0].qid) {
                    this.queue.songs.shift();
                    if (this.queue.repeat === 'single') {
                        Song.qid = shortid.generate();
                        this.queue.songs.unshift(Song);
                    }
                    if (this.queue.repeat === 'queue') {
                        this.queue.songs.push(Song);
                    }
                    if (this.queue.songs[0]) {
                        if (this.queue.songs[0].needsResolve) {
                            let song = this.queue.songs[0];
                            try {
                                this.queue.songs[0] = await ytr.resolve(song.url);
                                this.queue.songs[0].queuedBy = song.queuedBy;
                                await this.endSong();
                                this.play(this.queue.songs[0]);
                            } catch (e) {
                                winston.error(e);
                                this.nextSong(song);
                            }
                        } else {
                            await this.endSong();
                            this.play(this.queue.songs[0]);
                        }
                    } else {
                        this.endSong();
                    }
                }
            } else if (this.queue.songs[0]) {
                let song = this.queue.songs[0];
                this.queue.songs.shift();
                if (this.queue.repeat === 'single') {
                    song.qid = shortid.generate();
                    this.queue.songs.unshift(song);
                }
                if (this.queue.repeat === 'queue') {
                    this.queue.songs.push(song);
                }
                if (this.queue.songs[0]) {
                    if (this.queue.songs[0].needsResolve) {
                        let newSong = this.queue.songs[0];
                        try {
                            let queuedBy = this.queue.songs[0].queuedBy ? this.queue.songs[0].queuedBy : '-';
                            this.queue.songs[0] = await ytr.resolve(newSong.url);
                            this.queue.songs[0].queuedBy = queuedBy;
                            await this.endSong();
                            this.play(this.queue.songs[0]);
                            return song;
                        } catch (e) {
                            winston.error(e);
                            this.nextSong(newSong);
                        }
                    } else {
                        await this.endSong();
                        this.play(this.queue.songs[0]);
                        return song;
                    }
                } else {
                    this.endSong();
                    return song;
                }
            } else {
                this.endSong();
            }
        } else {
            this.endSong();
        }
    }

    async endSong(leave) {
        try {
            await this.connection.stopPlaying();
        } catch (e) {
            console.error(e);
            this.emit('debug', e);
        }
        clearTimeout(this.autoLeaveTimeout);
        if (leave) {
            this.started = false;
        } else {
            this.autoLeaveTimeout = setTimeout(() => {
                try {
                    let conn = rem.voiceConnections.get(this.connection.id);
                    if (conn) {
                        rem.voiceConnections.leave(this.connection.id);
                    }
                } catch (e) {
                    console.error(e);
                }
            }, 1000 * 60 * 10); // 10 Minutes
        }
        return Promise.resolve();
    }

    /**
     * Get the current queue of the player
     * @returns {{repeat: boolean, repeatId: string, voteskips: Array, songs: Array, time: string}}
     */
    getQueue() {
        if (this.connection.current || this.connection.timestamp) {
            let time = 0;
            if (!this.connection.current) {
                try {
                    time = this.connection.getTimestamp();
                } catch (e) {

                }
            } else {
                time = this.connection.current.playTime;
            }
            this.queue.time = this.convertSeconds(Math.floor(time / 1000));
        }
        return this.queue;
    }

    setQueue(queue) {
        this.queue = queue;
    }

    setQueueSongs(songs) {
        this.queue.songs = songs;
    }

    announce(Song) {
        if (this.channel !== '') {
            this.emit('announce', Song, this.channel);
        }
    }

    bind(id) {
        if (this.channel !== '') {
            this.channel = '';
            return false;
        } else {
            this.channel = id;
            return true;
        }
    }

    toggleRepeat(toggle) {
        switch (toggle) {
            case 'off':
                this.queue.repeat = toggle;
                return toggle;
            case 'single':
                this.queue.repeat = toggle;
                return toggle;
            case 'queue':
                this.queue.repeat = toggle;
                return toggle;
        }
    }

    toggleRepeatSingle() {
        if (this.queue.repeat === 'off') {
            this.queue.repeat = 'single';
            return 'single';
        } else if (this.queue.repeat === 'single') {
            this.queue.repeat = 'queue';
            return 'queue';
        } else {
            this.queue.repeat = 'off';
            return 'off';
        }
    }

    startQueue(msg) {

    }

    syncQueue() {

    }

    removeFromQueue(index) {

    }

    moveInQueue(oldIndex, newIndex) {

    }

    updateConnection(conn) {
        this.connection = conn;
    }

    pushQueue(Song) {
        this.queue.songs.push(Song);
    }

    /**
     * Converts time in seconds like 360 (10Minutes) to 10:00
     * @param time - the seconds the song has been playing for
     * @returns {string} - the converted string
     */
    convertSeconds(time) {
        let d = Number(time);
        let h = Math.floor(d / 3600);
        let m = Math.floor(d % 3600 / 60);
        let s = Math.floor(d % 3600 % 60);
        return ((h > 0 ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s);
    }
}
module.exports = Player;