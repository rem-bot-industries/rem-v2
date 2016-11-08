/**
 * Created by julia on 07.11.2016.
 */
var EventEmitter = require('events');
var YoutubeReg = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(&.*|)/;
var SoundcloudReg = /(?:http?s?:\/\/)?(?:www\.)?(?:soundcloud\.com|snd\.sc)\/(?:.*)/;
var osuRegex = /(?:http(?:s|):\/\/osu.ppy.sh\/(s|b)\/([0-9]*)((\?|\&)m=[0-9]|))/;
var niconicoRegex = /http(?:s|):\/\/?(?:www.|)nicovideo.jp\/watch\/[A-z0-9]+/;
var sc = require('./soundCloudImporter');
var yt = require('./youtubeImporter');
var nc = require('./niconicoImporter');
var ytdl = require('ytdl-core');
var youtubedl = require('youtube-dl');
/**
 * The Songimporter
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
        } else if (niconicoRegex.test(messageSearch)) {
            this.niconico(messageSearch);
        }
    }

    youtube(url) {
        let importer = new yt(url, this.ytdl);
        importer.on('done', () => {
            this.emit('done');
        });
    }

    soundcloud(url) {
        let importer = new sc(url, this.youtubedl);
        importer.on('done', () => {
            this.emit('done');
        });
    }

    niconico(url) {
        let importer = new nc(url, this.youtubedl);
        importer.on('done', () => {
            this.emit('done');
        });
    }

    osu(url) {

    }
}
module.exports = SongImporter;