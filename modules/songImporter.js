/**
 * Created by julia on 07.11.2016.
 */
var EventEmitter = require('eventemitter3');
var YoutubeReg = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(&.*|)/;
var SoundcloudReg = /(?:http?s?:\/\/)?(?:www\.)?(?:soundcloud\.com|snd\.sc)\/(?:.*)/;
var osuRegex = /(?:http(?:s|):\/\/osu.ppy.sh\/(s|b)\/([0-9]*)((\?|\&)m=[0-9]|))/;
var playlistReg = /[&?]list=([a-z0-9_\-]+)/gi;
var sc = require('./soundCloudImporter');
var yt = require('./youtubeImporter');
var pl = require('./playlistImporter');
var osu = require('./osuImporter');
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
        this.setMaxListeners(10);
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
        messageSearch = messageSearch.trim();
        this.findSong(messageSearch, (err, Song) => {
            if (err) {
                winston.error(err);
            }
            if (Song) {
                this.emit('done', Song);
            } else {
                if (YoutubeReg.test(messageSearch)) {
                    // let m;
                    // if ((m = playlistReg.exec(messageSearch)) !== null) {
                    //     winston.info('using Playlist!');
                    //     this.playlist(m[1]);
                    // } else {
                        this.youtube(messageSearch);
                    // }
                } else if (osuRegex.test(messageSearch)) {
                    this.osu(messageSearch);
                } else if (SoundcloudReg.test(messageSearch)) {
                    this.soundcloud(messageSearch);
                } else {
                    this.emit('error', 'generic.error');
                }
            }
        });
    }

    youtube(url) {
        let importer = new yt(url, this.ytdl);
        importer.once('done', (info) => {
            this.done(info);
            importer.removeAllListeners();
        });
        importer.once('error', (err) => {
            this.emit('error', err);
            importer.removeAllListeners();
        });
    }

    // playlist(id) {
    //     let importer = new pl(id, this.ytdl);
    //     importer.on('prefetch', (info, count) => {
    //         this.findSong(info.loaderUrl, (err, Song) => {
    //             if (err) {
    //                 winston.error(err);
    //             }
    //             if (Song) {
    //                 this.emit('pre', Song, count);
    //             } else {
    //                 this.saveSong(info, (err, Song) => {
    //                     if (err) return winston.info(err);
    //                     this.emit('pre', Song, count);
    //                 });
    //             }
    //         });
    //     });
    //     importer.once('done', (info) => {
    //         this.emit('playlist', info);
    //         importer.removeAllListeners();
    //     });
    //     importer.once('error', (err) => {
    //         this.emit('error', err);
    //         importer.removeAllListeners();
    //     });
    // }

    soundcloud(url) {
        let importer = new sc(url, this.youtubedl);
        importer.once('done', (info) => {
            this.done(info);
            importer.removeAllListeners();
        });
        importer.once('error', (err) => {
            this.emit('error', err);
            importer.removeAllListeners();
        });
    }

    osu(url) {
        let importer = new osu(url);
        this.emit('long', url);
        importer.once('done', (info) => {
            // console.log(info);
            this.done(info);
            importer.removeAllListeners();
        });
        importer.once('error', (err) => {
            this.emit('error', err);
            importer.removeAllListeners();
        });
    }

    done(info) {
        info.user = {name: this.msg.author.username, id: this.msg.author.id};
        this.saveSong(info, (err, Song) => {
            if (err) return this.emit('error', 'generic.error');
            this.emit('done', Song);
        });
        // let Song = {
        //     url: info.loaderUrl,
        //     title: info.title,
        //     id: info.id,
        //     addedBy: {name: this.msg.author.username, id: this.msg.author.id},
        //
        // };
        // this.emit('done', Song);
    }

    findSong(query, cb) {
        songModel.findOne({url: query}, (err, Song) => {
            if (err) return cb(err);
            if (Song) {
                return cb(null, Song);
            } else {
                return cb('no-song');
            }
        })
    }

    saveSong(info, cb) {
        let song = new songModel({
            title: info.title,
            alt_title: info.alt_title,
            url: info.loaderUrl,
            path: info.path ? info.path : "-",
            addedAt: new Date(),
            id: info.id,
            user: info.user,
            duration: this.convertDuration(info),
            plays: 0,
            votedUpBy: [],
            votedDownBy: [],
            lastPlay: null,
            type: info.type ? info.type : "stream"
        });
        song.save((err) => {
            if (err) {
                console.log(err);
                return cb(err);
            }
            cb(null, song);
        });
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
    }
    ;
}

module
    .exports = SongImporter;