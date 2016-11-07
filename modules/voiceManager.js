/**
 * Created by julia on 07.11.2016.
 */
var players = {};
var Player = require('./player');
var ytdl = require('ytdl-core');
var winston = require('winston');
var join = (msg, cb) => {
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
};
var play = (msg, cb) => {
    join(msg, (err, conn) => {
        if (err) return cb(err);
        players[msg.guild.id] = new Player(msg, conn, ytdl);
        players[msg.guild.id].play({url:'https://www.youtube.com/watch?v=iopIBbBcksE', title:'uwu'})
    });
};
var pause = (msg) => {
    try {
        players[msg.guild.id].pause();
    } catch(e) {

    }
};
var resume = (msg) => {
    try {
        players[msg.guild.id].resume();
    } catch(e) {

    }
};
module.exports = {join: join, play:play, pause:pause, resume:resume};