/**
 * Created by Julian/Wolke on 08.11.2016.
 */
/**
 * The youtube importer
 * @extends BasicImporter
 *
 */
let regex = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(?:&.*|)/;
let BasicImporter = require('../../structures/basicImporter');
const types = require('../../structures/constants').SONG_TYPES;
let Song = require('../../structures/song');
let ytdl = require('ytdl-core');
let youtube_dl = require('youtube-dl');
Promise.promisifyAll(youtube_dl);
Promise.promisifyAll(ytdl);
class YoutubeImporter extends BasicImporter {
    constructor() {
        super();
    }

    canResolve(url) {
        return regex.test(url);
    }

    async resolve(url) {
        // console.log(url);
        let info = await ytdl.getInfoAsync(url);
        if (info.live_playback === '1') {
            try {
                // console.log(info);
                let info = await this.resolveLiveStream(url);
                info.loaderUrl = `https://www.youtube.com/watch?v=${info.video_id}`;
                let streamUrl = this.filterLiveStreams(info.formats);
                if (!streamUrl) {
                    return Promise.reject({message: 'No suitable format found!'});
                } else {
                    return new Song({
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
                }
            } catch (e) {
                return Promise.reject({
                    message: 'Something went wrong while trying to resolve the livestream',
                    origError: e
                });
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
            return new Song({
                id: info.video_id,
                title: info.title,
                duration: this.convertDuration(info),
                type: types.youtube,
                url: info.loaderUrl,
                streamUrl: directUrl,
                isOpus: isOpus,
                isResolved: true,
                local: false
            });
        }
    }

    async resolveLiveStream(url) {
        return youtube_dl.getInfoAsync(url);
    }

    filterOpus(formats) {
        formats.sort((a, b) => {
            return parseInt(b.itag) - parseInt(a.itag);
        });
        for (let i = 0; i < formats.length; i++) {
            if (formats[i].itag === '251') {
                return formats[i].url;
            }
            if (formats[i].itag === '250') {
                return formats[i].url;
            }
        }
        return null;
    }

    filterStreams(formats) {
        for (let i = 0; i < formats.length; i++) {
            // console.log(formats[i]);
            if (formats[i].itag === '250' || formats[i].itag === '251') {
                // console.log(formats[i]);
                return formats[i].url;
            }
            if (formats[i].itag === '141' || formats[i].itag === '140') {
                return formats[i].url;
            }
            if (formats[i].container === 'mp4' && formats[i].audioEncoding || formats[i].container === 'webm' && formats[i].audioEncoding && formats[i].audioBitrate >= 128) {
                return formats[i].url;
            }
        }
        return null;
    }

    filterLiveStreams(formats) {
        for (let i = 0; i < formats.length; i++) {
            if (formats[i].itag === '94' || formats[i].format_id === '94') {
                return formats[i].url;
            }
        }
        for (let i = 0; i < formats.length; i++) {
            if (formats[i].itag === '93' || formats[i].itag === '95' || formats[i].format_id === '93' || formats[i].format_id === '95') {
                return formats[i].url;
            }
        }
        return formats[0].url;
    }
}
module.exports = new YoutubeImporter();
