/**
 * Created by julia on 08.11.2016.
 */
var BasicImporter = require('../Objects/basicImporter');
class NicoNicoImporter extends BasicImporter {
    constructor(url,ytdl) {
        super();
        this.url = url;
        this.loadSong();
        this.ytdl = ytdl;
    }

    loadSong() {
        this.youtubedl.getInfo(url, (err, info) => {
            if (err) {
                this.emit('error', err);
            } else {
                console.log(info);
                // info.loaderUrl = info.url;
                // this.emit('done', info);
            }
        });
    }
}
module.exports = NicoNicoImporter;