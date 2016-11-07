/**
 * Created by julia on 07.11.2016.
 */
var EventEmitter = require('events');
var YoutubeReg = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(&.*|)/;
var SoundcloudReg = /(?:http?s?:\/\/)?(?:www\.)?(?:soundcloud\.com|snd\.sc)\/(?:.*)/;
var osuRegex = /(?:http(?:s|):\/\/osu.ppy.sh\/(s|b)\/([0-9]*)((\?|\&)m=[0-9]|))/;
var ytdl = require('ytdl-core');
var youtubedl = require('youtube-dl');
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
        } else if (SoundcloudReg.test(messageSearch)) {
            this.soundcloud(messageSearch);
        } else if (osuRegex.test(messageSearch)) {
            this.osu(messageSearch);
        }
    }

    youtube(url) {
        this.ytdl.getInfo(url, (err, info) => {
            if (err) {
                this.emit('error', err);
            } else {
                info.id = info.video_id;
                this.emit('done', info);
            }
        });
    }

    soundcloud(url) {
        this.youtubedl.getInfo(url, (err, info) => {
            if (err) {
                this.emit('error', err);
            } else {
                info.loaderUrl = info.url;
                this.emit('done', info);
            }
        });
    }

    osu(url) {

    }
}
module.exports = SongImporter;