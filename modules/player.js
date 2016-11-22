/**
 * Created by julia on 07.11.2016.
 */
var EventEmitter = require('eventemitter3');
var shortid = require('shortid');
var YoutubeReg = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(&.*|)/;
var winston = require('winston');
var request = require("request");
var path = require("path");
var fs = require("fs");
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
     * @param {Object} ytdl
     */
    constructor(msg, connection, ytdl) {
        super();
        this.setMaxListeners(1);
        this.msg = msg;
        this.queue = {repeat: false, repeatId: '', voteskips: [], songs: [], time: ""};
        this.dispatcher = null;
        this.ytdl = ytdl;
        this.connection = connection;
        this.song = null;
        // setInterval(() => {
        //     console.log(this.queue);
        // }, 30 * 1000);
    }

    /**
     * Plays a Song
     * @param {Object} Song - the song to play
     */
    play(Song) {
        if (this.connection) {
            let stream;
            if (YoutubeReg.test(Song.url)) {
                var options = {
                    filter: (format) => format.container === 'mp4' && format.audioEncoding || format.container === 'webm' && format.audioEncoding,
                    quality: ['250', '249', '140', '141', '139', 'lowest'],
                    audioonly: true
                };
                stream = this.ytdl(Song.url, options)
            } else {
                if (Song.type === "osuV2") {
                    try {
                        stream = fs.createReadStream(Song.path);
                    } catch (e) {
                        this.emit('error', e);
                    }
                } else {
                    stream = request(Song.url);
                }
            }
            this.dispatcher = this.connection.playStream(stream, {volume: 0.25, passes: 3});
            // winston.info(path.resolve(Song.path));
            // updatePlays(Song.id).then(() => {
            //
            // }).catch(err => {
            //     winston.error(err);
            // });
            // message.channel.sendMessage(t('play.playing', {
            //     lngs: message.lang,
            //     song: Song.title,
            //     interpolation: {escape: false}
            // }));
            this.announce(Song);
            this.dispatcher.on("end", () => {
                winston.info("File ended!");
                this.nextSong(Song);
            });
            // this.dispatcher.on("debug", information => {
            //     winston.info(`Debug: ${information}`);
            // });
            this.dispatcher.on("error", (err) => {
                winston.info(`Error: ${err}`);
            });
        } else {
        }
    }

    /**
     * Pauses the song
     */
    pause() {
        try {
            this.dispatcher.pause();
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
            this.dispatcher.resume();
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
        Song.qid = shortid.generate();
        if (immediate) {
            this.queue.songs.unshift(Song);
            this.play(Song);
        } else {
            this.queue.songs.push(Song);
        }
        if (this.queue.songs.length === 1 && !immediate) {
            this.play(Song);
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
                    if (this.queue.songs[0]) {
                        this.play(this.queue.songs[0]);
                    } else {
                        this.endSong();
                    }
                }
            } else {
                this.queue.songs.shift();
                if (this.queue.songs[0]) {
                    this.play(this.queue.songs[0]);
                } else {
                    this.endSong();
                }
            }
        }
    }

    endSong() {
        try {
            this.dispatcher.end();
        } catch (e) {
            this.emit('debug', e);
        }
    }

    /**
     * Get the current queue of the player
     * @returns {{repeat: boolean, repeatId: string, voteskips: Array, songs: Array, time: string}|*}
     */
    getQueue() {
        this.queue.time = this.convertSeconds(Math.floor(this.dispatcher.time / 1000));
        return this.queue;
    }

    announce(Song) {

    }

    setVolume(vol) {
        try {
            this.dispatcher.setVolume(vol);
        } catch (e) {
            this.emit('error', e);
        }
    }

    updatePlays(Song) {

    }

    startQueue(msg) {

    }

    syncQueue() {

    }

    /**
     * Converts time in seconds like 360 (10Minutes) to 10:00
     * @param s - the seconds the song has been playing for
     * @returns {string} - the converted string
     */
    convertSeconds(s) {
        return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s
    }
}
module.exports = Player;