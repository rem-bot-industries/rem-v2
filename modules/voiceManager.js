/**
 * Created by julia on 07.11.2016.
 */
let Player = require('./player');
let ytdl = require('ytdl-core');
let winston = require('winston');
let EventEmitter = require('eventemitter3');
let SongImporter = require('./songImporter');
// let Selector = require('./selector');
let async = require("async");
class VoiceManager extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(200);
        this.players = {};
    }

    join(msg, cb) {
        if (msg.guild) {
            let conn = rem.voiceConnections.get(msg.guild.id);
            if (!conn) {
                if (msg.member.voiceState.channelID) {
                    rem.joinVoiceChannel(msg.member.voiceState.channelID).then((connection) => {
                        cb(null, connection);
                    }).catch(err => {
                        console.log(err);
                        return cb('joinVoice.error');
                    });
                } else {
                    cb('joinVoice.no-voice');
                }
            } else {
                console.log('Found Connection!');
                cb(null, conn);
            }
        }
    }

    leave(msg, cb) {
        if (msg.guild) {
            let conn = rem.voiceConnections.get(msg.guild.id);
            if (conn) {
                rem.voiceConnections.leave(msg.guild.id);
                this.players[msg.guild.id] = null;
                delete this.players[msg.guild.id];
                cb();
            } else {
                cb('generic.no-voice');
            }
        }
    }

    play(msg) {
        this.addToQueue(msg, true);
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
            importer.once('search-result', (results) => {
                importer.removeAllListeners();
                this.emit('search-result', results);
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
            this.players[msg.guild.id].toggleRepeatSingle(true);
            let song = this.players[msg.guild.id].nextSong();
            this.emit('skipped', song);
        }
    }

    repeat(msg) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined') {
            return this.players[msg.guild.id].toggleRepeatSingle();
        } else {
            return null;
        }
    }

    bind(msg) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined') {
            this.players[msg.guild.id].bind(msg.channel.id);
            this.players[msg.guild.id].on('announce', (song, channel) => {
                rem.createMessage(channel, `:arrow_forward: **${song.title}** \<${song.url}\>`)
            });
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
                    }, 100);
                } else {
                    this.players[msg.guild.id] = new Player(msg, conn, ytdl);
                    this.players[msg.guild.id].addToQueue(song, false);
                    setTimeout(() => {
                        cb();
                    }, 100);
                }
            }, (err) => {
                if (err) return winston.error(err);
            });
        });
    }

    shuffleQueue() {

    }
}
module.exports = VoiceManager;