/**
 * Created by julia on 08.11.2016.
 */
let BasicImporter = require('../../structures/basicImporter');
const types = require('../../structures/constants').SONG_TYPES;
const Song = require('../../structures/song');
class SoundcloudImporter extends BasicImporter {
    constructor(url,loader) {
        super();
        this.url = url;
        this.dl = loader;
        this.loadSong();
    }

    loadSong() {
        this.dl.getInfo(this.url, (err, info) => {
            if (err) {
                this.emit('error', err);
            } else {
                info.loaderUrl = info.url;
                info.web_url = this.url;
                let song = new Song({
                    id: info.id,
                    title: info.title,
                    duration: this.convertDuration(info),
                    type: types.soundcloud,
                    streamUrl: info.loaderUrl,
                    url: info.web_url,
                    isResolved: true,
                    local: false
                });
                this.emit('done', song);
            }
        });
    }
}
module.exports = SoundcloudImporter;