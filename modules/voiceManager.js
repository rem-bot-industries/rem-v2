/**
 * Created by julia on 07.11.2016.
 */
var Player = require('./player');
var ytdl = require('ytdl-core');
var winston = require('winston');
var EventEmitter = require('eventemitter3');
var SongImporter = require('./songImporter');
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
                        cb('joinVoice.error');
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
            if (err) return this.emit('error', err);
            let importer = new SongImporter(msg);
            importer.once('error', (err) => {
                this.emit('error', err);
                importer.removeAllListeners();
            });
            importer.once('done', (Song) => {
                importer.removeAllListeners();
                msg.channel.sendMessage(`Now Playing ${Song.title}`);
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
            let importer = new SongImporter(msg);
            importer.once('long', (url) => {
                this.emit('info', 'qa.started-download', url);
            });
            importer.on('pre', (Song, count) => {
                if (count === 0) {
                    msg.channel.sendMessage(`Queued ${Song.title}`);
                }
                if (typeof (this.players[msg.guild.id]) !== 'undefined') {
                    this.players[msg.guild.id].addToQueue(Song, immediate);
                } else {
                    this.players[msg.guild.id] = new Player(msg, conn, ytdl);
                    this.players[msg.guild.id].addToQueue(Song, immediate);
                }
            });
            importer.once('playlist', (songs) => {
                importer.removeAllListeners();
                msg.channel.sendCode('json', JSON.stringify(songs));
            });
            importer.once('error', (err) => {
                importer.removeAllListeners();
                this.emit('error', err);
            });
            importer.once('done', (Song) => {
                importer.removeAllListeners();
                msg.channel.sendMessage(`Queued ${Song.title}`);
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
            this.players[msg.guild.id].nextSong();
        }
    }
}
module.exports = VoiceManager;