/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../Objects/command');
/**
 * The vote skip command
 * @extends Command
 *
 */
class ForceSkip extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor(t, v) {
        super();
        this.cmd = "skip";
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.msg = null;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.once('error', (err) => {
            this.v.removeAllListeners();
            msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
        });
        this.v.once('skipped', (song) => {
            this.v.removeAllListeners();
            msg.channel.createMessage(this.t('skip.success', {lngs: msg.lang, title: song.title}));
        });
        if (msg.member.voiceChannel && this.v.getConnection(msg) && msg.member.voiceChannel.equals(this.v.getConnection(msg).channel)) {
            let channel = msg.member.voiceChannel;
            if (channel.members.size > 2) {
                this.msg = msg;
                this.startVoteskip(msg);
            } else {
                this.v.forceSkip(msg);
            }
        }
    }

    startVoteskip(msg) {
        let voted = [msg.author.id];

        let collector = new MessageCollector(msg.channel, (msg, coll) => {
            if (msg.content === `${this.msg.prefix}yes` && this.checkVoted(msg, voted)) {
                return true
            }
        }, {});
        collector.on('message', (msg) => {

        });
    }

    checkVoted(msg, voted) {
        for (let i = 0; i < voted.length; i++) {
            if (msg.authod.id === voted[i]) {
                return false;
            }
        }
        return true;
    }
}
module.exports = ForceSkip;