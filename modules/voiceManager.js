/**
 * Created by julia on 07.11.2016.
 */
var Player = require('./player');
var ytdl = require('ytdl-core');
var winston = require('winston');
var EventEmitter = require('eventemitter3');
var SongImporter = require('./songImporter');
var Selector = require('./selector');
var async = require("async");
class VoiceManager extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(200);
        this.players = {};
    }

    join(msg, cb) {
        if (msg.guild) {
            if (!msg.guild.voiceConnection) {
                if (msg.member.voiceChannel) {
                    msg.member.voiceChannel.join().then((connection) => {
                        cb(null, connection);
                    }).catch(err => {
                        console.log(err);
                        return cb('joinVoice.error');
                    });
                } else {
                    cb('joinVoice.no-voice');
                }
            } else {
                cb(null, msg.guild.voiceConnection);
            }
        }
    }

    leave(msg, cb) {
        if (msg.guild) {
            if (msg.guild.voiceConnection) {
                let conn = msg.guild.voiceConnection;
                conn.channel.leave();
                this.players[msg.guild.id] = null;
                delete this.players[msg.guild.id];
                cb();
            } else {
                cb('generic.no-voice');
            }
        }
    }

    play(msg) {
        this.join(msg, (err, conn) => {
            if (err) {
                console.log(err);
                return this.emit('error', err);
            }
            let importer = new SongImporter(msg, true);
            importer.once('error', (err) => {
                this.emit('error', err);
                importer.removeAllListeners();
            });
            importer.once('done', (Song) => {
                importer.removeAllListeners();
                this.emit('done', Song);
                if (typeof (this.players[msg.guild.id]) !== 'undefined') {
                    this.players[msg.guild.id].addToQueue(Song, true);
                } else {
                    this.players[msg.guild.id] = new Player(msg, conn, ytdl);
                    this.players[msg.guild.id].addToQueue(Song, true);
                }
            });
        });
    }

    pause(msg) {
        try {
            this.players[msg.guild.id].pause();
            this.emit('success');
        } catch (e) {
            this.emit('error');
        }
    }

    resume(msg) {
        try {
            this.players[msg.guild.id].resume();
            this.emit('success');
        } catch (e) {
            this.emit('error');
        }
    }

    addToQueue(msg, immediate) {
        this.join(msg, (err, conn) => {
            if (err) return this.emit('error', err);
            let importer = new SongImporter(msg, true);
            importer.once('long', (url) => {
                this.emit('info', 'qa.started-download', url);
            });
            importer.once('error', (err) => {
                importer.removeAllListeners();
                this.emit('error', err);
            });
            importer.once('done', (Song) => {
                importer.removeAllListeners();
                this.emit('added', Song);
                if (typeof (this.players[msg.guild.id]) !== 'undefined') {
                    this.players[msg.guild.id].addToQueue(Song, immediate);
                } else {
                    this.players[msg.guild.id] = new Player(msg, conn, ytdl);
                    this.players[msg.guild.id].addToQueue(Song, immediate);
                }
            });
        });
    }

    getQueue(msg) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined') {
            let queue = this.players[msg.guild.id].getQueue();
            if (queue.songs.length > 0) {
                this.emit('queue', queue);
            } else {
                this.emit('error', 'generic.no-song-in-queue');
            }
        } else {
            this.emit('error', 'generic.no-song-in-queue');
        }
    }

    forceSkip(msg) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined') {
            let song = this.players[msg.guild.id].nextSong();
            this.emit('skipped', song);
        }
    }

    getConnection(msg) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined') {
            return this.players[msg.guild.id].connection;
        } else {
            return null;
        }
    }

    setVolume(msg, vol) {
        try {
            this.players[msg.guild.id].setVolume(vol);
            this.emit('success');
        } catch (e) {
            console.log(e);
            this.emit('error');
        }
    }

    addToQueueBatch(msg, songs) {
        this.join(msg, (err, conn) => {
            if (err) return this.emit('error', err);
            console.log('BATCH ' + songs.length);
            async.eachSeries(songs, (song, cb) => {
                if (typeof (this.players[msg.guild.id]) !== 'undefined') {
                    this.players[msg.guild.id].addToQueue(song, false);
                    setTimeout(() => {
                        cb();
                    }, 500);
                } else {
                    this.players[msg.guild.id] = new Player(msg, conn, ytdl);
                    this.players[msg.guild.id].addToQueue(song, false);
                    setTimeout(() => {
                        cb();
                    }, 500);
                }
            }, (err) => {
                if (err) return winston.error(err);
            });
        });
    }
}
module.exports = VoiceManager;