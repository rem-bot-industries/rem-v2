/**
 * Created by julia on 07.11.2016.
 */
var EventEmitter = require('eventemitter3');
var YoutubeReg = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(&.*|)/;
var SoundcloudReg = /(?:http?s?:\/\/)?(?:www\.)?(?:soundcloud\.com|snd\.sc)\/(?:.*)/;
var osuRegex = /(?:http(?:s|):\/\/osu.ppy.sh\/(s|b)\/([0-9]*)((\?|\&)m=[0-9]|))/;
var sc = require('./soundCloudImporter');
var yt = require('./youtubeImporter');
var ytdl = require('ytdl-core');
var youtubedl = require('youtube-dl');
var songModel = require('../DB/song');
var winston = require('winston');
/**
 * The song importer
 * @extends EventEmitter
 *
 */
class SongImporter extends EventEmitter {
    constructor(msg) {
        super();
        this.setMaxListeners(20);
        this.msg = msg;
        this.messageSplit = msg.content.split(' ');
        this.ytdl = ytdl;
        this.youtubedl = youtubedl;
        this.importSong();
    }

    importSong() {
        var messageSearch = "";
        for (var i = 1; i < this.messageSplit.length; i++) {
            messageSearch = messageSearch + " " + this.messageSplit[i]
        }
        if (YoutubeReg.test(messageSearch)) {
            this.youtube(messageSearch);
        } else if (osuRegex.test(messageSearch)) {
            this.osu(messageSearch);
        } else if (SoundcloudReg.test(messageSearch)) {
            this.soundcloud(messageSearch);
        }
    }

    youtube(url) {
        let importer = new yt(url, this.ytdl);
        importer.on('done', (info) => {
            this.done(info);
        });
        importer.on('error', (err) => {
            this.emit('error', err);
        });
    }

    soundcloud(url) {
        let importer = new sc(url, this.youtubedl);
        importer.on('done', (info) => {
            this.done(info);
        });
        importer.on('error', (err) => {
            this.emit('error', err);
        });
    }

    osu(url) {
        // this.done(info);
    }

    done(info) {
        let Song = {
            url: info.loaderUrl,
            title: info.title,
            id: info.id,
            addedBy: {name: this.msg.author.username, id: this.msg.author.id},
            duration: this.convertDuration(info)
        };
        this.emit('done', Song);
    }

    saveSong(Song) {
        let song = new songModel({})
    }

    convertDuration(info) {
        let durationConv = null;
        if (typeof (info.duration) === 'undefined' && typeof (info.length_seconds) === 'undefined') {
            return durationConv;
        }
        if (typeof (info.duration) !== 'undefined') {
            let durationSplit = info.duration.split(':');
            for (var i = 0; i < durationSplit.length; i++) {
                if (i !== durationSplit.length - 1) {
                    if (durationSplit[i].length === 1) {
                        durationConv = durationConv + '0' + durationSplit[i] + ':';
                    } else {
                        durationConv = durationConv + durationSplit[i] + ':';
                    }
                } else {
                    if (durationSplit[i].length === 1) {
                        durationConv = durationConv + '0' + durationSplit[i];
                    } else {
                        durationConv = durationConv + durationSplit[i];
                    }
                }
            }
            winston.info(durationConv);
        } else if (typeof (info.length_seconds) !== 'undefined') {
            let d = Number(info.length_seconds);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
            return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
        }
    };
}
module.exports = SongImporter;