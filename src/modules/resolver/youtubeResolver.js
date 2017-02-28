/**
 * Created by Julian/Wolke on 08.11.2016.
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
let youtube_dl = require('youtube-dl');
Promise.promisifyAll(youtube_dl);
class YoutubeImporter extends BasicImporter {
    constructor() {
        super();
    }

    async loadSong(url) {
        try {
            ytdl.getInfo(url, async(err, info) => {
                if (err) {
                    this.emit('error', err);
                } else {
                    if (info.live_playback === '1') {
                        try {
                            let info = await this.resolveLiveStream(url);
                            info.loaderUrl = `https://www.youtube.com/watch?v=${info.video_id}`;
                            let streamUrl = this.filterLiveStreams(info.formats);
                            if (!streamUrl) {
                                this.emit('error', 'No suitable format found!');
                            } else {
                                let song = new Song({
                                    id: info.video_id,
                                    title: info.title,
                                    duration: 'live',
                                    type: types.youtube_live,
                                    url: info.loaderUrl,
                                    streamUrl: streamUrl,
                                    isResolved: true,
                                    local: false,
                                    live: true,
                                    isOpus: false
                                });
                                this.emit('done', song);
                            }
                        } catch (e) {
                            this.emit('error', e);
                        }
                    } else {
                        info.loaderUrl = `https://www.youtube.com/watch?v=${info.video_id}`;
                        let directUrl = this.filterOpus(info.formats);
                        let isOpus = false;
                        if (directUrl) {
                            isOpus = true;
                        } else {
                            directUrl = this.filterStreams(info.formats);
                        }
                        let song = new Song({
                            id: info.video_id,
                            title: info.title,
                            duration: this.convertDuration(info),
                            type: types.youtube,
                            url: info.loaderUrl,
                            streamUrl: directUrl += '&ratebypass=yes',
                            isOpus: isOpus,
                            isResolved: true,
                            local: false
                        });
                        this.emit('done', song);
                    }
                }
            });
        } catch (e) {
            this.emit('error', e);
        }
    }

    resolveSong(song) {
        let that = this;
        return new Promise(function (resolve, reject) {
            ytdl.getInfo(song.url, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    if (info.live_playback === '1') {
                        reject(err)
                    } else {
                        info.loaderUrl = `https://www.youtube.com/watch?v=${info.video_id}`;
                        let directUrl = that.filterOpus(info.formats);
                        let isOpus = false;
                        if (directUrl) {
                            isOpus = true;
                        } else {
                            directUrl = that.filterStreams(info.formats);
                        }
                        let song = new Song({
                            id: info.video_id,
                            title: info.title,
                            duration: that.convertDuration(info),
                            type: types.youtube,
                            url: info.loaderUrl,
                            streamUrl: directUrl += '&ratebypass=yes',
                            needsYtdl: !directUrl,
                            isOpus: isOpus,
                            isResolved: true,
                            local: false
                        });
                        resolve(song);
                    }
                }
            });
        });
    }

    async resolveLiveStream(url) {
        return youtube_dl.getInfoAsync(url);
    }

    filterOpus(formats) {
        for (let i = 0; i < formats.length; i++) {
            // console.log(formats[i].itag);
            if (formats[i].itag === '250' || formats[i].itag === '251' || formats[i].itag === '249') {
                return formats[i].url;
            }
        }
        return null;
    }

    filterStreams(formats) {
        for (let i = 0; i < formats.length; i++) {
            // console.log(formats[i].itag);
            if (formats[i].itag === '250' || formats[i].itag === '251' || formats[i].itag === '249') {
                // console.log(formats[i]);
                return formats[i].url;
            }
            if (formats[i].container === 'mp4' && formats[i].audioEncoding || formats[i].container === 'webm' && formats[i].audioEncoding) {
                return formats[i].url;
            }
            if (formats[i].audioEncoding) {
                return formats[i].url;
            }
        }
        return null;
    }

    filterLiveStreams(formats) {
        for (let i = 0; i < formats.length; i++) {
            if (formats[i].format_id === '94') {
                return formats[i].url;
            }
        }
        for (let i = 0; i < formats.length; i++) {
            if (formats[i].format_id === '93' || formats[i].format_id === '95') {
                return formats[i].url;
            }
        }
        return null;
    }
}
module.exports = YoutubeImporter;