/**
 * Created by julia on 07.11.2016.
 */
let EventEmitter = require('eventemitter3');
let shortid = require('shortid');
let winston = require('winston');
let request = require("request");
let path = require("path");
let fs = require("fs");
let SongTypes = require('../../structures/constants').SONG_TYPES;
let mergeJSON = require("merge-json");
let YtResolver = require('../resolver/youtubeResolver');
let ytr = new YtResolver();
let beta = require('../../config/main.json').beta;
let StatsD = require('hot-shots');
let dogstatsd = new StatsD();
let stat = beta ? 'rem-beta' : 'rem-live';
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
     * @param {Object} ytdl Youtube Download
     * @param {Object} queue The queue
     */
    constructor(msg, connection, ytdl, queue) {
        super();
        this.setMaxListeners(20);
        this.msg = msg;
        this.queue = queue ? queue : {id: msg.guild.id, repeat: 'off', voteskips: [], songs: [], time: ""};
        this.ytdl = ytdl;
        this.connection = connection;
        this.song = null;
        this.channel = '';
        this.started = false;
        this.autoplay();
        // setInterval(() => {
        //     this.emit('sync', this.queue);
        // }, 1000 * 30);
    }

    /**
     * Plays a Song
     * @param {Song} Song - the song to play
     */
    play(Song) {
        if (this.connection && this.connection.ready) {
            let stream;
            let options = {};
            dogstatsd.increment(`${stat}.music.play`);
            if (Song.type === SongTypes.youtube) {
                dogstatsd.increment(`${stat}.music.youtube`);
                if (!Song.needsYtdl) {
                    dogstatsd.increment(`${stat}.music.youtube.opus`);
                    try {
                        stream = request(Song.streamUrl);
                    } catch (e) {
                        winston.error(e);
                    }
                    stream.on('error', (err) => {
                        winston.error(err);
                    });
                    options.format = 'webm';
                    options.frameDuration = 20;
                } else {
                    dogstatsd.increment(`${stat}.music.youtube.nonopus`);
                    let options = {
                        filter: (format) => format.container === 'mp4' && format.audioEncoding || format.container === 'webm' && format.audioEncoding,
                        quality: ['250', '249', '251', '140', '141', '139', 'lowest'],
                        audioonly: true
                    };
                    try {
                        stream = this.ytdl(Song.url, options)
                    } catch (e) {
                        winston.error(e);
                    }
                    stream.on('error', (err) => {
                        winston.error(err);
                    });
                }
            } else if (Song.type === SongTypes.soundcloud) {
                dogstatsd.increment(`${stat}.music.soundcloud`);
                stream = request(Song.streamUrl);
                stream.on('error', (err) => {
                    winston.error(err);
                });
            } else if (Song.type === SongTypes.osu) {
                dogstatsd.increment(`${stat}.music.osu`);
                try {
                    stream = fs.createReadStream(Song.url);
                } catch (e) {
                    this.emit('error', e);
                }
                stream.on('error', (err) => {
                    winston.error(err);
                });
            }
            this.connection.play(stream, options);
            // winston.info(path.resolve(Song.path));
            // updatePlays(Song.id).then(() => {
            //
            // }).catch(err => {
            //     winston.error(err);
            // });
            // message.channel.createMessage(t('play.playing', {
            //     lngs: message.lang,
            //     song: Song.title,
            //     interpolation: {escape: false}
            // }));
            this.announce(Song);
            this.connection.once("end", () => {
                // winston.info("File ended!");
                setTimeout(() => {
                    this.nextSong(Song);
                }, 100);
            });
            // this.dispatcher.on("debug", information => {
            //     winston.info(`Debug: ${information}`);
            // });
            this.connection.on("error", (err) => {
                winston.info(`Error: ${err}`);
                this.nextSong(Song);
            });
        }

        else {
            setTimeout(() => {
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
            this.emit('pause');
        } catch (e) {
            this.emit('debug', e);
        }
    }

    /**
     * Resumes the song
     */
    resume() {
        try {
            this.connection.resume();
            this.emit('resume');
        } catch (e) {
            this.emit('debug', e);
        }
    }

    /**
     * Adds a song to the queue
     * @param Song - the song that should be added to the queue
     * @param immediate - if the song should be played immediately
     */
    addToQueue(Song, immediate) {
        this.toggleRepeatSingle(true);
        if (immediate) {
            this.queue.songs.unshift(Song);
            this.endSong();
            this.play(Song);
        } else {
            this.queue.songs.push(Song);
        }
        if (this.queue.songs.length === 1 && !immediate || this.queue.songs.length > 0 && !this.started) {
            this.started = true;
            this.play(this.queue.songs[0]);
        }
    }

    autoplay() {
        if (this.queue.songs.length > 0 && !this.started) {
            this.started = true;
            this.play(this.queue.songs[0]);
        }
    }

    /**
     * Plays the next song, can be used to skip songs
     * @param Song - the song that is skipped (optional)
     */
    nextSong(Song) {
        if (this.queue.songs.length > 0) {
            if (typeof (Song) !== 'undefined') {
                if (Song.qid === this.queue.songs[0].qid) {
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
                            ytr.resolveSong(song).then(resolvedSong => {
                                this.queue.songs[0] = mergeJSON.merge(song, resolvedSong);
                                this.endSong();
                                this.play(this.queue.songs[0]);
                            }).catch(err => {
                                winston.error(err);
                                this.nextSong(song);
                            });
                        } else {
                            this.endSong();
                            this.play(this.queue.songs[0]);
                        }
                    } else {
                        this.endSong();
                    }
                }
            } else {
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
                        let song = this.queue.songs[0];
                        ytr.resolveSong(song).then(resolvedSong => {
                            this.queue.songs[0] = mergeJSON.merge(song, resolvedSong);
                            this.endSong();
                            this.play(this.queue.songs[0]);
                        }).catch(err => {
                            winston.error(err);
                            this.nextSong(song);
                        });
                    } else {
                        this.endSong();
                        this.play(this.queue.songs[0]);
                    }
                } else {
                    this.endSong();
                }
                return song;
            }
        } else {
            this.connection.stopPlaying();
        }
    }

    endSong() {
        try {
            this.connection.stopPlaying();
        } catch (e) {
            this.emit('debug', e);
        }
    }

    /**
     * Get the current queue of the player
     * @returns {{repeat: boolean, repeatId: string, voteskips: Array, songs: Array, time: string}|*}
     */
    getQueue() {
        if (this.connection.current) {
            this.queue.time = this.convertSeconds(Math.floor(this.connection.current.playTime / 1000));
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
            this.channel = "";
            return false;
        } else {
            this.channel = id;
            return true;
        }
    }

    toggleRepeatSingle(off) {
        if (off) {
            this.queue.repeat = 'off';
        } else {
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
    }

    startQueue(msg) {

    }

    syncQueue() {

    }

    randomizeQueue() {

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
        return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
    }
}
module.exports = Player;