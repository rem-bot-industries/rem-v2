/**
 * Created by julia on 07.11.2016.
 */
var voiceManager = require('../modules/voiceManager');
var Command = require('../Objects/command');
/**
 * The show queue command,
 * shows the current queue
 * @extends Command
 *
 */
class Queue extends Command {
    /**
     * Create the resume command
     * @param {Function} t - the translation module
     */
    constructor(t) {
        super();
        this.cmd = "queue";
        this.cat = "voice";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        voiceManager.getQueue(msg);
        voiceManager.on('error', (err) => {
            msg.channel.sendMessage(this.t(err));
        });
        voiceManager.on('queue', (queue) => {
            console.log('nice');
            console.log(queue);
            msg.channel.sendCode('', JSON.stringify(queue));
        });
    }
}
module.exports = Queue;