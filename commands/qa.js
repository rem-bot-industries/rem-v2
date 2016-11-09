/**
 * Created by julia on 07.11.2016.
 */
var voiceManager = require('../modules/voiceManager');
var Command = require('../Objects/command');
var SongImporter = require('../modules/songImporter');
/**
 * The addToQueueCommand
 * @extends Command
 *
 */
class Play extends Command {
    /**
     * Create the pause command
     * @param {Function} t - the translation module
     */
    constructor(t) {
        super();
        this.cmd = "qa";
        this.cat = "voice";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
       let importer = new SongImporter(msg);
       importer.on('done', (info) =>  {
           // console.log(info);
           let Song = {url:info.loaderUrl, title:info.title, id:info.id};
           voiceManager.addToQueue(msg, Song);
           voiceManager.on('error', (err) => {
               (this.t(err));
           })
       });
    }
}
module.exports = Play;