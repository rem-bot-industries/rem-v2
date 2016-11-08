/**
 * Created by julia on 07.11.2016.
 */
var Player = require('./player');
var ytdl = require('ytdl-core');
var winston = require('winston');
var EventEmitter = require('events');
class VoiceManager extends EventEmitter {
    constructor(bot) {
        super();
        this.setMaxListeners(20);
        this.players = {};
    }

    join(msg, cb) {
        if (msg.guild) {
            if (!msg.guild.voiceConnection) {
                if (msg.member.voiceChannel) {
                    msg.member.voiceChannel.join().then((connection) => {
                        cb(null, connection);
                    }).catch(err => {
                        cb('no-access-voice');
                    });
                } else {
                    cb('no-voice');
                }
            } else {
                cb(null, msg.guild.voiceConnection);
            }
        }
    }

    play(msg, url) {
        this.join(msg, (err, conn) => {
            if (err) return this.emit('error', err);
            this.players[msg.guild.id] = new Player(msg, conn, ytdl);
            this.players[msg.guild.id].play({url: url, title: 'uwu'});
        });
    }

    pause(msg) {
        try {
            this.players[msg.guild.id].pause();
        } catch (e) {

        }
    }

    resume(msg) {
        try {
            this.players[msg.guild.id].resume();
        } catch (e) {

        }
    }

    addToQueue(msg, url) {
        this.join(msg, (err, conn) => {
            if (err) return this.emit('error', err);
            if (typeof (this.players[msg.guild.id]) !== 'undefined') {
                this.players[msg.guild.id].addToQueue({url: url, title: 'test2'});
            }
        });
    }
    forceSkip(msg) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined') {
            this.players[msg.guild.id].nextSong();
        }
    }
}
var manager = new VoiceManager();
module.exports = manager;