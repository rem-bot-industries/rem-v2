/**
 * Created by julia on 08.11.2016.
 */
/**
 * The youtube importer
 * @extends EventEmitter
 *
 */
var db = require('./dbManager');
var r = db.getR();
var BasicImporter = require('../Objects/basicImporter');
class YoutubeImporter extends BasicImporter {
    constructor(url,ytdl) {
        super();
        this.url = url;
        this.ytdl = ytdl;
        this.loadSong();
    }
    loadSong(){
        this.ytdl.getInfo(this.url, (err, info) => {
            if (err) {
                this.emit('error', err);
            } else {
                info.id = info.video_id;
                this.emit('done', info);
            }
        });
    }
}
module.exports = YoutubeImporter;