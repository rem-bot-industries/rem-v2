/**
 * Created by julia on 08.11.2016.
 */
/**
 * The youtube importer
 * @extends EventEmitter
 *
 */
let BasicImporter = require('../../structures/basicImporter');
const types = require('../../structures/constants').SONG_TYPES;
let Song = require('../../structures/song');
let ytdl = require('ytdl-core');
class YoutubeImporter extends BasicImporter {
    constructor() {
        super();
    }

    loadSong(url) {
        ytdl.getInfo(url, (err, info) => {
            if (err) {
                this.emit('error', err);
            } else {
                info.loaderUrl = `https://www.youtube.com/watch?v=${info.video_id}`;
                let directUrl = this.filterStreams(info.formats);
                let song = new Song({
                    id: info.video_id,
                    title: info.title,
                    duration: this.convertDuration(info),
                    type: types.youtube,
                    url: info.loaderUrl,
                    streamUrl: directUrl,
                    needsYtdl: !directUrl,
                    isResolved: true,
                    local: false
                });
                this.emit('done', song);
            }
        });
    }

    resolveSong(song) {
        let that = this;
        return new Promise(function (resolve, reject) {
            ytdl.getInfo(song.url, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    info.loaderUrl = `https://www.youtube.com/watch?v=${info.video_id}`;
                    let directUrl = that.filterStreams(info.formats);
                    let song = new Song({
                        id: info.video_id,
                        title: info.title,
                        duration: that.convertDuration(info),
                        type: types.youtube,
                        url: info.loaderUrl,
                        streamUrl: directUrl,
                        needsYtdl: !directUrl,
                        isResolved: true,
                        local: false
                    });
                    resolve(song);
                }
            });
        });
    }

    filterStreams(formats) {
        for (let i = 0; i < formats.length; i++) {
            // console.log(formats[i].itag);
            if (formats[i].itag === '250' || formats[i].itag === '251' || formats[i].itag === '249') {
                // console.log(formats[i]);
                return formats[i].url;
            }
        }
        return null;
    }
}
module.exports = YoutubeImporter;