/**
 * Created by julia on 07.11.2016.
 */
let EventEmitter = require('eventemitter3');
let YoutubeReg = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(&.*|)/;
let SoundcloudReg = /(?:http?s?:\/\/)?(?:www\.)?(?:soundcloud\.com|snd\.sc)\/(?:.*)/;
let osuRegex = /(?:http(?:s|):\/\/osu.ppy.sh\/(s|b)\/([0-9]*)((\?|\&)m=[0-9]|))/;
let keys = require('../../config/keys.json').keys;
let sc = require('./soundCloudResolver');
let yt = require('./youtubeResolver');
let pl = require('./playlistResolver');
let osu = require('./osuResolver');
let ytdl = require('ytdl-core');
let youtubedl = require('youtube-dl');
let winston = require('winston');
let youtubesearch = require('youtube-search');
let KeyManager = require('../keyManager');
let km = new KeyManager(keys);
let Song = require('../../structures/song');
const SongTypes = require('../../structures/constants').SONG_TYPES;
let opts = {
    maxResults: 10,
    key: km.getKey(),
    type: 'video',
    order: 'relevance'
};
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
            this.resolveSong();
        }
    }

    resolveSong() {
        // console.log(this.messageSplit);
        if (this.messageSplit.length > 1) {
            this.messageSplit.shift();
        }
        let messageSearch = this.messageSplit.join(' ');
        messageSearch = messageSearch.trim().replace('<', '').replace('>', '');
        if (YoutubeReg.test(messageSearch)) {
            console.log('Youtube - single');
            this.youtube(messageSearch);
        } else if (osuRegex.test(messageSearch)) {
            this.osu(messageSearch);
        } else if (SoundcloudReg.test(messageSearch)) {
            this.soundcloud(messageSearch);
        } else {
            if (messageSearch !== '') {
                this.search(messageSearch);
            } else {
                this.emit('error', 'qa.empty-search');
            }
        }
    }

    search(search) {
        youtubesearch(search, opts, (err, results) => {
            if (err) {
                winston.error(err);
                winston.info('Switching Keys!');
                km.nextKey();
                opts.key = km.getKey();
                return this.search(search);
            }
            if (results.length > 0) {
                this.emit('search-result', results);
            } else {
                this.emit('error', 'generic.error');
            }
        });
    }

    youtube(url) {
        let importer = new yt();
        importer.loadSong(url);
        importer.once('done', (song) => {
            this.emit('done', song);
            importer.removeAllListeners();
        });
        importer.once('error', (err) => {
            this.emit('error', err);
            importer.removeAllListeners();
        });
    }

    playlist(id) {
        let importer = new pl(id);
        importer.loadPlaylist(id, (err, songs) => {

        });
    }

    soundcloud(url) {
        let importer = new sc(url, this.youtubedl);
        importer.once('done', (song) => {
            this.emit('done', song);
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
        importer.once('done', (song) => {
            // console.log(info);
            this.emit('done', song);
            importer.removeAllListeners();
        });
        importer.once('error', (err) => {
            this.emit('error', err);
            importer.removeAllListeners();
        });
    }
}

module.exports = SongImporter;