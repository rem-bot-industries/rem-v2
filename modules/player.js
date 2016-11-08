/**
 * Created by julia on 07.11.2016.
 */
var EventEmitter = require('events');
var db = require('./dbManager');
var r = db.getR();
var beta = require('../config/main.json').beta;
var url;
if (beta) {
    url = 'http://localhost:7011/s/'
} else {
    url = 'http://localhost:7010/s/'
}
var YoutubeReg = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(&.*|)/;
var winston = require('winston');
var request = require("request");
var path = require("path");
/**
 * The audio player
 * @extends EventEmitter
 *
 */
class Player extends EventEmitter {
    /**
     * Create the pause command
     * @param {Object} msg - the message
     * @param {Object} connection the voice connection
     * @param {Object} ytdl
     */
    constructor(msg,connection, ytdl) {
        super();
        this.setMaxListeners(1);
        this.msg = msg;
        this.queue = {repeat:false, repeatId:'', voteskips:[], songs:[]};
        this.dispatcher = null;
        this.time = "";
        this.ytdl = ytdl;
        this.connection = connection;
        this.song = null;
        setInterval(() => {
            console.log(this.queue.songs);
        }, 10*1000);
        // this.play();
    }
    /**
     * Create the stats engine.
     * @param {number} Song - the song to play
     */
    play(Song) {
        if (this.connection) {
            this.queue.songs.push(Song);
            let stream;
            if (YoutubeReg.test(Song.url)) {
                var options = {
                    filter: (format) => format.container === 'mp4' && format.audioEncoding || format.container === 'webm' && format.audioEncoding,
                    quality: ['140', '141', '139', 'lowest'],
                    audioonly: true
                };
                stream = this.ytdl(Song.url, options)
            } else {
                stream = request(Song.url);
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
                this.emit('announce', Song.title);
            this.dispatcher.on("end", function () {
                try {
                    this.dispatcher.setVolume(0);
                } catch (e) {

                }
                winston.info("File ended!");
                this.nextSong();
            });
            this.dispatcher.on("debug", information => {
                winston.info(`Debug: ${information}`);
            });
            this.dispatcher.on("error", function (err) {
                winston.info(`Error: ${err}`);
            });
            // });
            // player.on('error', (e) => {
            //     winston.error(e);
            // })
        } else {
            // client.captureMessage(`No connection found for Guild ${message.guild.name}`, {
            //     extra: {'Guild': message.guild.id},
            //     'voiceConnection': message.guild.voiceConnection
            // });
        }
    }
    pause() {
        try {
            this.dispatcher.resume();
            this.emit('pause');
        } catch (e) {
            this.emit('debug', e);
        }
    }
    resume() {
        try {
            this.dispatcher.resume();
            this.emit('resume');
        } catch (e) {
            this.emit('debug', e);
        }
    }
    addToQueue(Song) {
        this.queue.songs.push(Song);
    }
    nextSong(Song) {
        this.queue.songs.shift();
        if (this.queue.songs.length > 0) {
            this.play(this.queue.songs[0]);
        }
        // if (inVoiceChannel(message)) {
        //     let connectionVoice = getVoiceConnection(message);
        //     let dispatcher = getDispatcherFromConnection(connectionVoice);
        //     queueModel.findOne({server: message.guild.id}, function (err, Queue) {
        //         if (err) return winston.info(err);
        //         if (Queue) {
        //             if (Queue.songs.length > 0) {
        //                 if (typeof (Queue.repeat) !== 'undefined' && typeof (Queue.repeatId) !== 'undefined' && Queue.repeat && Song.id === Queue.repeatId) {
        //                     playSong(message, Song, true);
        //                 } else if (typeof (Queue.repeat) !== 'undefined' && typeof (Queue.repeatId) !== 'undefined' && Queue.repeat === false) {
        //                     {
        //                         Queue.stopRepeat(function (err) {
        //                             if (err) return winston.info(err);
        //                             if (Queue.songs[0].id === Song.id) {
        //                                 queueModel.update({_id: Queue._id}, {$pop: {songs: -1}}, function (err) {
        //                                     if (err) return winston.info(err);
        //                                     queueModel.findOne({_id: Queue._id}, function (err, Queue) {
        //                                         if (err) return winston.info(err);
        //                                         if (Queue.songs.length > 0) {
        //                                             Queue.resetVotes(function (err) {
        //                                                 if (err) return winston.info(err);
        //                                                 if (Queue.songs[0].type !== 'radio') {
        //                                                     try {
        //                                                         dispatcher.setVolume(0);
        //                                                     } catch (e) {
        //                                                         winston.info(e);
        //                                                     }
        //                                                     playSong(message, Queue.songs[0], true);
        //                                                 } else {
        //                                                     nextSong(message, Queue.songs[0]);
        //                                                 }
        //                                             });
        //                                         } else {
        //                                             Queue.resetVotes();
        //                                             try {
        //                                                 dispatcher.end();
        //                                             } catch (e) {
        //                                                 winston.info(e);
        //                                             }
        //                                         }
        //                                     });
        //                                 });
        //                             }
        //                         });
        //                     }
        //                 } else {
        //                     if (Queue.songs[0].id === Song.id) {
        //                         queueModel.update({_id: Queue._id}, {$pop: {songs: -1}}, function (err) {
        //                             if (err) return winston.info(err);
        //                             queueModel.findOne({_id: Queue._id}, function (err, Queue) {
        //                                 if (err) return winston.info(err);
        //                                 if (Queue.songs.length > 0) {
        //                                     Queue.resetVotes(function (err) {
        //                                         if (err) return winston.info(err);
        //                                         playSong(message, Queue.songs[0], true);
        //                                     });
        //                                 } else {
        //                                     Queue.resetVotes();
        //                                     try {
        //                                         dispatcher.end();
        //                                     } catch (e) {
        //                                         winston.info(e);
        //                                     }
        //                                 }
        //                             });
        //                         });
        //                     }
        //                 }
        //             } else {
        //                 Queue.resetVotes();
        //                 try {
        //                     dispatcher.end();
        //                 } catch (e) {
        //
        //                 }
        //             }
        //         } else {
        //
        //         }
        //     });
        // }
    }
    startQueue(msg) {

    }
    setTime(time) {
        this.time = time;
    }
}
module.exports = Player;