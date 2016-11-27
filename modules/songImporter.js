/**
 * Created by julia on 07.11.2016.
 */
let EventEmitter = require('eventemitter3');
let YoutubeReg = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(&.*|)/;
let SoundcloudReg = /(?:http?s?:\/\/)?(?:www\.)?(?:soundcloud\.com|snd\.sc)\/(?:.*)/;
let osuRegex = /(?:http(?:s|):\/\/osu.ppy.sh\/(s|b)\/([0-9]*)((\?|\&)m=[0-9]|))/;
let sc = require('./soundCloudImporter');
let yt = require('./youtubeImporter');
let pl = require('./playlistImporter');
let osu = require('./osuImporter');
let ytdl = require('ytdl-core');
let youtubedl = require('youtube-dl');
let songModel = require('../DB/song');
let winston = require('winston');
/**
 * The song importer
 * @extends EventEmitter
 *
 */
class SongImporter extends EventEmitter {
    constructor(msg, instant) {
        super();
        this.setMaxListeners(10);
        this.msg = msg;
        this.messageSplit = msg.content.split(' ');
        this.ytdl = ytdl;
        this.youtubedl = youtubedl;
        if (instant) {
            this.importSong();
        }
    }

    importSong() {
        let messageSearch = "";
        for (let i = 1; i < this.messageSplit.length; i++) {
            messageSearch = messageSearch + " " + this.messageSplit[i]
        }
        messageSearch = messageSearch.trim().replace('<', '').replace('>', '');
        this.findSong(messageSearch, (err, Song) => {
            if (err) {
                winston.error(err);
            }
            if (Song) {
                this.emit('done', Song);
            } else {
                if (YoutubeReg.test(messageSearch)) {
                    console.log('Youtube - single');
                    this.youtube(messageSearch);
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

    playlist(id) {
        let importer = new pl(id, this.ytdl);
        importer.on('prefetch', (info, count) => {
            this.importSong(info, (err, Song) => {
                if (err) return this.emit('error', 'generic.error');
                this.emit('pre', Song, count);
            });
        });
        importer.on('one', (info) => {
            this.importSong(info, (err, Song) => {
                if (err) return winston.error(err);
            });
        });
        importer.once('done', (info) => {
            this.emit('playlist', info);
            importer.removeAllListeners();
        });
        importer.once('error', (err) => {
            this.emit('error', err);
            importer.removeAllListeners();
        });
    }

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
        this.importSongDB(info, (err, Song) => {
            if (err) return this.emit('error', 'generic.error');
            this.emit('done', Song);
        });
    }

    importSongDB(info, cb) {
        this.findSong(info.loaderUrl, (err, Song) => {
            if (err) {
                console.log(err);
            }
            if (Song) {
                cb(null, Song);
            } else {
                this.saveSong(info, (err, Song) => {
                    if (err) return cb(err);
                    return cb(null, Song);
                });
            }
        });
    }

    findSong(query, cb) {
        let search = {};
        if (SoundcloudReg.test(query)) {
            console.log('Soundcloud');
            search.web_url = query
        } else {
            search.url = query;
        }
        songModel.findOne(search, (err, Song) => {
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
            web_url: info.web_url,
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
                console.log('error');
                return cb(err);
            }
            cb(null, song);
        });
    }

    convertDuration(info) {
        let durationConv = "";
        if (typeof (info.duration) === 'undefined' && typeof (info.length_seconds) === 'undefined') {
            return durationConv;
        }
        if (typeof (info.duration) !== 'undefined') {
            let durationSplit = info.duration.split(':');
            for (let i = 0; i < durationSplit.length; i++) {
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
            return durationConv;
        } else if (typeof (info.length_seconds) !== 'undefined') {
            let d = Number(info.length_seconds);
            let h = Math.floor(d / 3600);
            let m = Math.floor(d % 3600 / 60);
            let s = Math.floor(d % 3600 % 60);
            return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
        }
    }
    ;
}

module
    .exports = SongImporter;