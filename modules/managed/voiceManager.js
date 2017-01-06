/**
 * Created by julia on 07.11.2016.
 */
let Manager = require('../../structures/manager');
let Player = require('./../audio/player');
let ytdl = require('ytdl-core');
let winston = require('winston');
let SongImporter = require('./../resolver/songResolver');
let queueModel = require('../../DB/queue');
// let Selector = require('./selector');
let async = require("async");
let PlaylistResolver = require('../resolver/playlistResolver');
let shortid = require("shortid");
class VoiceManager extends Manager {
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
                        if (typeof (this.players[msg.guild.id]) === 'undefined') {
                            this.createPlayer(msg, connection, ytdl).then(player => {
                                cb(null, connection);
                            }).catch(err => cb(err));
                        }
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
                this.players[msg.guild.id].setQueueSongs([]);
                this.players[msg.guild.id].endSong();
                rem.voiceConnections.leave(msg.guild.id);
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
            this.emit(`${msg.id}_success`);
        } catch (e) {
            this.emit(`${msg.id}_error`);
        }
    }

    resume(msg) {
        try {
            this.players[msg.guild.id].resume();
            this.emit(`${msg.id}_success`);
        } catch (e) {
            this.emit(`${msg.id}_error`);
        }
    }

    addPlaylistToQueue(msg) {
        this.join(msg, (err, conn) => {
            if (err) return this.emit(`${msg.id}_error`, err);
            let id = msg.content.split(' ').splice(1);
            let pl = new PlaylistResolver(id);
            pl.loadPlaylist(id, (err, playlist) => {
                if (err) return this.emit(`${msg.id}_error`, err);
                this.players[msg.guild.id].addToQueue(playlist.songs[0]);
                for (let i = 1; i < playlist.songs.length; i++) {
                    this.players[msg.guild.id].pushQueue(playlist.songs[i]);
                }
                this.emit(`${msg.id}_pl_added`, playlist);
            });
        });
    }

    addToQueue(msg, immediate) {
        this.join(msg, (err, conn) => {
            if (err) return this.emit('error', err);
            let importer = new SongImporter(msg, true);
            importer.once('long', (url) => {
                this.emit(`${msg.id}_info`, 'qa.started-download', url);
            });
            importer.once('search-result', (results) => {
                importer.removeAllListeners();
                this.emit(`${msg.id}_search-result`, results);
            });
            importer.once('error', (err) => {
                importer.removeAllListeners();
                this.emit(`${msg.id}_error`, err);
            });
            importer.once('done', (Song) => {
                importer.removeAllListeners();
                this.emit(`${msg.id}_added`, Song);
                if (typeof (this.players[msg.guild.id]) !== 'undefined') {
                    this.players[msg.guild.id].updateConnection(conn);
                    this.players[msg.guild.id].addToQueue(Song, immediate);
                } else {
                    this.createPlayer(msg, conn, ytdl).then(player => {
                        this.players[msg.guild.id].addToQueue(Song, immediate);
                    }).catch(err => winston.error);
                }
            });
        });
    }

    getQueue(msg) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined') {
            let queue = this.players[msg.guild.id].getQueue();
            if (queue.songs.length > 0) {
                this.emit(`${msg.id}_queue`, queue);
            } else {
                this.emit(`${msg.id}_error`, 'generic.no-song-in-queue');
            }
        } else {
            this.emit(`${msg.id}_error`, 'generic.no-song-in-queue');
        }
    }

    getCurrentSong(msg) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined') {
            let queue = this.players[msg.guild.id].getQueue();
            if (queue.songs.length > 0) {
                this.emit(`${msg.id}_queue`, queue);
            } else {
                this.emit(`${msg.id}_error`, 'generic.no-song-in-queue');
            }
        } else {
            this.emit(`${msg.id}_error`, 'generic.no-song-in-queue');
        }
    }

    forceSkip(msg) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined') {
            this.players[msg.guild.id].toggleRepeatSingle(true);
            let song = this.players[msg.guild.id].nextSong();
            if (song) {
                this.emit(`${msg.id}_skipped`, song);
            }
        }
    }

    repeat(msg) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined') {
            return this.players[msg.guild.id].toggleRepeatSingle();
        } else {
            return 'off';
        }
    }

    bind(msg, cb) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined') {
            let res = this.players[msg.guild.id].bind(msg.channel.id);
            this.players[msg.guild.id].on('announce', (song, channel) => {
                rem.createMessage(channel, `:arrow_forward: **${song.title}** \<${song.url}\>`)
            });
            cb(res);
        } else {
            cb(null);
        }
    }

    createPlayer(msg, conn, ytdl) {
        return new Promise((resolve, reject) => {
            this.loadQueue(msg.guild.id, (err, queue) => {
                if (err) {
                    winston.error(err);
                    reject(err);
                } else {
                    if (!this.players[msg.guild.id]) {
                        this.players[msg.guild.id] = new Player(msg, conn, ytdl, queue);
                        this.players[msg.guild.id].on('sync', (queue) => {
                            this.syncQueue(queue)
                        });
                    }
                    this.players[msg.guild.id].updateConnection(conn);
                    resolve(this.players[msg.guild.id]);
                }
            });

        });

    }

    shuffleQueue() {

    }

    syncQueue(queue) {
        this.loadQueue(queue.id, (err, dbQueue) => {
            if (err) return winston.error(err);
            queueModel.update({id: queue.id}, {$set: queue}, (err) => {
                if (err) return winston.error(err);
                console.log('synced Queue')
            });
        });
    }

    loadQueue(id, cb) {
        queueModel.findOne({id: id}, (err, Queue) => {
            if (err) return cb(err);
            if (Queue) {
                cb(null, Queue);
            } else {
                this.createQueue(id, cb);
            }
        });
    }

    createQueue(id, cb) {
        let Queue = new queueModel({
            id: id
        });
        Queue.save(cb);
    }
}
module.exports = {class: VoiceManager, deps: [], async: false, shortcode: 'vm'};