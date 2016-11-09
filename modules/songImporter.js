/**
 * Created by julia on 07.11.2016.
 */
var EventEmitter = require('events');
var YoutubeReg = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(&.*|)/;
var SoundcloudReg = /(?:http?s?:\/\/)?(?:www\.)?(?:soundcloud\.com|snd\.sc)\/(?:.*)/;
var osuRegex = /(?:http(?:s|):\/\/osu.ppy.sh\/(s|b)\/([0-9]*)((\?|\&)m=[0-9]|))/;
var sc = require('./soundCloudImporter');
var yt = require('./youtubeImporter');
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
        }
    }

    youtube(url) {
        let importer = new yt(url, this.ytdl);
        importer.on('done', (info) => {
            this.done(info);
        });
    }

    soundcloud(url) {
        let importer = new sc(url, this.youtubedl);
        importer.on('done', (info) => {
            this.done(info);
        });
    }

    osu(url) {
        // this.done(info);
    }
    done(info) {
        let Song = {url:info.loaderUrl, title:info.title, id:info.id};
        this.emit('done', Song);
    }
}
module.exports = SongImporter;