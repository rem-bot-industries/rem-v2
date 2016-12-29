/**
 * Created by julia on 08.11.2016.
 */
/**
 * The youtube importer
 * @extends EventEmitter
 *
 */
let BasicImporter = require('../structures/basicImporter');
class YoutubeImporter extends BasicImporter {
    constructor(url,ytdl) {
        super();
        this.url = url;
        this.dl = ytdl;
        this.loadSong();
    }
    loadSong(){
        this.dl.getInfo(this.url, (err, info) => {
            if (err) {
                this.emit('error', err);
            } else {
                info.id = info.video_id;
                info.loaderUrl = `https://www.youtube.com/watch?v=${info.id}`;
                this.emit('done', info);
            }
        });
    }
}
module.exports = YoutubeImporter;