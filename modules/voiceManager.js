/**
 * Created by julia on 07.11.2016.
 */
var players = {};
var Player = require('./player');
var ytdl = require('ytdl-core');
var winston = require('winston');
var join = (msg) => {
    if (msg.guild) {
        if (!msg.guild.voiceConnection) {
            if (msg.member.voiceChannel) {
                msg.member.voiceChannel.join().then((connection) => {
                    players[msg.guild.id] = new Player(msg, connection, ytdl);
                    players[msg.guild.id].play({url:'https://www.youtube.com/watch?v=iopIBbBcksE', title:'uwu'})
                }).catch(err => {
                    winston.info(err);

                });
            } else {
                // return cb(t('joinVoice.no-voice', {lngs: message.lang}));
            }
        } else {
            // cb(null, message);
        }
    }
};
var pause = (msg) => {

};
var resume = (msg) => {

};
module.exports = {join:join};