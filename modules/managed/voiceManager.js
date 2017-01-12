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
let shuffle = require('knuth-shuffle').knuthShuffle;
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

    pause(msg) {
        try {
            this.players[msg.guild.id].pause();
            this.emit(`${msg.id}_success`);
        } catch (e) {
            this.emit(`${msg.id}_error`);
        }
    }

    shuffle(msg) {
        let vm = this;
        return new Promise(function (resolve, reject) {
            let conn = rem.voiceConnections.get(msg.guild.id);
            if (!conn) {
                reject({err: 'Rem is not connected to a voice channel.', t: 'generic.no-voice'});
            }
            if (vm.players[msg.guild.id]) {
                let queue = vm.players[msg.guild.id].getQueue();
                if (queue.songs.length < 3) {
                    reject({
                        err: 'There are not enough songs in the queue to shuffle it.',
                        t: 'shuffle.not-enough-shuffle'
                    })
                }
                let currentSong = queue.songs.shift();
                let shuffledQueue = shuffle(queue.songs.splice(0));
                shuffledQueue.unshift(currentSong);
                vm.players[msg.guild.id].setQueueSongs(shuffledQueue);
                resolve({t: 'shuffle.success'});
            } else {
                reject({err: 'There is no player object atm.', t: 'generic.no-voice'});
            }
        })

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
        let that = this;
        return new Promise(function (resolve, reject) {
            that.join(msg, (err, conn) => {
                if (err) {
                    reject({type: 'error', event: `${msg.id}_error`, err: err});
                } else {
                    let id = msg.content.split(' ').splice(1);
                    let pl = new PlaylistResolver(id);
                    pl.loadPlaylist(id, (err, playlist) => {
                        if (err) {
                            reject({type: 'error', event: `${msg.id}_error`, err: err});
                        } else {
                            that.players[msg.guild.id].addToQueue(playlist.songs[0]);
                            for (let i = 1; i < playlist.songs.length; i++) {
                                that.players[msg.guild.id].pushQueue(playlist.songs[i]);
                            }
                            resolve({type: 'pl_added', event: `${msg.id}_pl_added`, data: playlist});
                        }
                    });
                }
            });

        });

    }

    addToQueue(msg, immediate) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.join(msg, (err, conn) => {
                if (err) return reject({type: 'error', event: `${msg.id}_error`, err: err});
                let importer = new SongImporter(msg, true);
                importer.once('search-result', (results) => {
                    importer.removeAllListeners();
                    that.emit(`${msg.id}_search-result`, results);
                    resolve({type: 'search_result', event: `${msg.id}_search-result`, data: results})
                });
                importer.once('error', (err) => {
                    importer.removeAllListeners();
                    reject({type: 'error', event: `${msg.id}_error`, err: err});
                });
                importer.once('done', (Song) => {
                    importer.removeAllListeners();
                    that.emit(`${msg.id}_added`, Song);
                    if (typeof (that.players[msg.guild.id]) !== 'undefined') {
                        that.players[msg.guild.id].updateConnection(conn);
                        that.players[msg.guild.id].addToQueue(Song, immediate);
                        console.log('uwu');
                        resolve({type: 'added', event: `${msg.id}_added`, data: Song});
                    } else {
                        that.createPlayer(msg, conn, ytdl).then(player => {
                            that.players[msg.guild.id].addToQueue(Song, immediate);
                            resolve({type: 'added', event: `${msg.id}_added`, data: Song});
                        }).catch(err => {
                            winston.error(err);
                            reject({type: 'error', event: `${msg.id}_error`, err: err});
                        });
                    }
                });
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

    forceSkip(msg, howMany) {
        let vm = this;
        return new Promise(function (resolve, reject) {
            if (typeof (vm.players[msg.guild.id]) !== 'undefined') {
                vm.players[msg.guild.id].toggleRepeatSingle(true);
                if (howMany) {
                    let queue = vm.players[msg.guild.id].getQueue(msg);
                        let current = queue.songs.shift();
                    if (howMany === 'all') {
                        queue.songs = [current];
                        vm.players[msg.guild.id].setQueueSongs(queue.songs);
                        vm.players[msg.guild.id].nextSong();
                        resolve({t: 'skip.all'});
                    } else {
                        let songsToSkip = 0;
                        try {
                            songsToSkip = parseInt(howMany);
                        } catch (e) {
                            reject({err: e, t: 'generic.nan'});
                        }
                        if (isNaN(songsToSkip) || songsToSkip <= 0) {
                            reject({t: 'generic.nan'});
                        }
                        if (songsToSkip > queue.songs.length) {
                            reject({t: 'generic.nan'});
                        }
                        for (let i = 0; i < songsToSkip - 1; i++) {
                            queue.songs.shift()
                        }
                        queue.songs.unshift(current);
                        vm.players[msg.guild.id].setQueueSongs(queue.songs);
                        let song = vm.players[msg.guild.id].nextSong();
                        resolve({t: 'skip.some', amount: songsToSkip});
                    }
                } else {
                    let song = vm.players[msg.guild.id].nextSong();
                    if (song) {
                        resolve({title: song.title, t: 'skip.success'});
                    }
                }
            } else {
                reject({t: 'generic.no-song-in-queue'});
            }
            }
        );
    }

    queueRemove(msg, args) {
        let vm = this;
        return new Promise(function (resolve, reject) {
            if (typeof (vm.players[msg.guild.id]) !== 'undefined') {
                vm.players[msg.guild.id].toggleRepeatSingle(true);
                let queue = vm.players[msg.guild.id].getQueue(msg);
                if (args === 'all') {
                    let current = queue.songs.shift();
                    let length = queue.songs.length;
                    queue.songs = [current];
                    vm.players[msg.guild.id].setQueueSongs(queue.songs);
                    resolve({t: 'qra.success', number: length});
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
                            reject({err: e, t: 'generic.nan'});
                        }
                        if (start >= 1 && start <= queue.songs.length && end >= 2 && end <= queue.songs.length) {
                            let counter = start > end ? end : start;
                            let secondCounter = start > end ? start : end;
                            for (let i = counter - 1; i < secondCounter; i++) {
                                queue.songs.splice(counter - 1, 1);
                            }
                            vm.players[msg.guild.id].setQueueSongs(queue.songs);
                            resolve({t: 'qra.success', number: secondCounter - counter});
                        } else {
                            console.log(start);
                            console.log(end);
                            console.log(queue.songs.length);
                        }
                    } else if (range2.length > 1) {
                        let ids = [];
                        for (let i = 0; i < range2.length; i++) {
                            let id = 0;
                            try {
                                id = parseInt(range2[i])
                            } catch (e) {
                                reject({err: e, t: 'generic.nan'});
                            }
                            if (id <= queue.songs.length && id >= 1) {
                                ids.push(id);
                            } else {
                                reject({err: e, t: 'generic.nan'});
                            }
                        }
                        ids.sort((a, b) => {
                            return b - a
                        });
                        for (let i = 0; i < ids.length; i++) {
                            queue.songs.splice(ids[i] - 1, 1);
                        }
                        resolve({t: 'qra.success', number: ids.length});
                    } else {
                        let songIndex = 0;
                        try {
                            songIndex = parseInt(args);
                        } catch (e) {
                            reject({err: e, t: 'generic.nan'});
                        }
                        console.log(songIndex);
                        console.log(queue.songs.length);

                        if (isNaN(songIndex) || songIndex <= 1 || songIndex > queue.songs.length) {
                            console.log(songIndex);
                            reject({t: 'generic.nan'});
                        }
                        let songToSkip = queue.songs[songIndex - 1];
                        if (songIndex > -1) {
                            queue.songs.splice(songIndex - 1, 1);
                        }
                        vm.players[msg.guild.id].setQueueSongs(queue.songs);
                        resolve({t: 'qra.removed', title: songToSkip.title});
                    }
                }
            } else {
                reject({t: 'generic.no-song-in-queue'});
            }
        });
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