/**
 * Created by julia on 07.11.2016.
 */
let EventEmitter = require('eventemitter3');
let shortid = require('shortid');
let YoutubeReg = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(&.*|)/;
let winston = require('winston');
let request = require("request");
let path = require("path");
let fs = require("fs");
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
        // }, 1000 * 300);
    }

    /**
     * Plays a Song
     * @param {Object} Song - the song to play
     */
    play(Song) {
        if (this.connection && this.connection.ready) {
            let stream;
            let opus = false;
            if (YoutubeReg.test(Song.url)) {
                this.ytdl.getInfo(Song.url, (err, info) => {
                    if (err) {
                        winston.error(err);
                        this.emit('error');
                        return this.nextSong(Song);
                    }
                    // console.log('got info!');
                    let url = this.filterStreams(info.formats);
                    // console.log(url);
                    if (url) {
                        // console.log(url);
                        console.log('Streaming opus');
                        try {
                            stream = request(url);
                        } catch (e) {
                            winston.error(e);
                        }
                        stream.on('error', (err) => {
                            winston.error(err);
                        });
                        opus = true;
                    } else {
                        let options = {
                            filter: (format) => format.container === 'mp4' && format.audioEncoding || format.container === 'webm' && format.audioEncoding,
                            quality: ['250', '249', '251', '140', '141', '139', 'lowest'],
                            audioonly: true
                        };
                        console.log('Streaming ytdl');
                        try {
                            stream = this.ytdl(Song.url, options)
                        } catch (e) {
                            winston.error(e);
                        }
                        stream.on('error', (err) => {
                            winston.error(err);
                        });
                    }
                    let options = {};
                    if (opus) {
                        options.format = 'webm';
                        options.frameDuration = 20;
                    }
                    this.connection.play(stream, options);
                });
            } else {
                if (Song.type === "osuV2") {
                    try {
                        stream = fs.createReadStream(Song.path);
                    } catch (e) {
                        this.emit('error', e);
                    }
                    stream.on('error', (err) => {
                        winston.error(err);
                    });
                } else {
                    stream = request(Song.url);
                    stream.on('error', (err) => {
                        winston.error(err);
                    });
                }
                this.connection.play(stream);
            }
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
                winston.info("File ended!");
                setTimeout(() => {
                    this.nextSong(Song);
                }, 100);
            });
            // this.dispatcher.on("debug", information => {
            //     winston.info(`Debug: ${information}`);
            // });
            this.connection.on("error", (err) => {
                winston.info(`Error: ${err}`);
            });
        } else {
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
        Song.qid = shortid.generate();
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
                        this.endSong();
                        this.play(this.queue.songs[0]);
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
                    this.endSong();
                    this.play(this.queue.songs[0]);
                } else {
                    this.endSong();
                }
                return song;
            }
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

    setVolume(vol) {
        try {
            this.connection.setVolume(vol);
        } catch (e) {
            this.emit('error', e);
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

    updatePlays(Song) {

    }

    startQueue(msg) {

    }

    syncQueue() {

    }

    randomizeQueue() {

    }

    filterStreams(formats) {
        for (let i = 0; i < formats.length; i++) {
            // console.log(formats[i].itag);
            if (formats[i].itag === '250' || formats[i].itag === '251' || formats[i].itag === '249') {
                // console.log(formats[i]);
                return formats[i].url;
            }
        }
        return null;
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