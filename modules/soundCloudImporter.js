/**
 * Created by julia on 08.11.2016.
 */
var BasicImporter = require('../Objects/basicImporter');
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
                this.emit('done', info);
            }
        });
    }
}
module.exports = SoundcloudImporter;