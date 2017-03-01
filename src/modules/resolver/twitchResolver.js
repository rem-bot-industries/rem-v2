/**
 * Created by julia on 28.02.2017.
 */
let Song = require('../../structures/song');
let BasicImporter = require('../../structures/basicImporter');
let youtube_dl = require('youtube-dl');
Promise.promisifyAll(youtube_dl);
let SongTypes = require('../../structures/constants').SONG_TYPES;
class TwitchResolver extends BasicImporter {
    constructor(url) {
        super();
        this.url = url;
    }

    async resolve(url) {
        let info = await youtube_dl.getInfoAsync(url);
        if (!info.is_live) {
            throw new Error('Channel is not Live!');
        }
        let streamUrl = this.filterFormats(info);
        if (!streamUrl) {
            throw new Error('No suitable format found!');
        }
        let song = new Song({
            id: info.id,
            type: SongTypes.twitch,
            title: info.uploader_id,
            streamUrl: streamUrl,
            url: info.webpage_url,
            duration: "live",
            needsResolve: false,
            needsYtdl: false,
            live: true
        });
        return Promise.resolve(song);
    }

    filterFormats(info) {
        for (let i = 0; i < info.formats.length; i++) {
            // console.log(formats[i].itag);
            if (info.formats[i].format_id === 'Audio_Only') {
                return info.formats[i].url;
            }
        }
        for (let i = 0; i < info.formats.length; i++) {
            // console.log(formats[i].itag);
            if (info.formats[i].format_id === 'Medium' || info.formats[i].format_id === 'High') {
                return info.formats[i].url;
            }
        }
        return null;
    }
}
module.exports = TwitchResolver;