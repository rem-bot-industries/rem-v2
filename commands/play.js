/**
 * Created by julia on 07.11.2016.
 */
var voiceManager = require('../modules/voiceManager');
var Command = require('../Objects/command');
var SongImporter = require('../modules/songImporter');
/**
 * The play command
 * plays a song duh.
 * @extends Command
 *
 */
class Play extends Command {
    /**
     * Create the stats engine.
     * @param {number} t - the translation module
     */
    constructor(t) {
        super();
        this.cmd = "play";
        this.cat = "voice";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
    }

   run(msg) {
       let importer = new SongImporter(msg);
       importer.on('done', (info) =>  {
           console.log(info);
           let Song = {url:info.loaderUrl, title:info.title};
           voiceManager.play(msg, Song.url);
           voiceManager.on('error', (err) => {

           })
       });
    }
}
module.exports = Play;