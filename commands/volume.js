/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
class Volume extends Command {
    constructor(t, v) {
        super();
        this.cmd = "volume";
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
    }

    run(msg) {
        var messageSplit = msg.content.split(' ');
        this.v.once('error', (err) => {
            console.log(err);
            msg.channel.sendMessage(this.t('generic.error', {lngs: msg.lang}));
        });
        this.v.once('success', () => {
            msg.channel.sendMessage(':ok_hand: ');
        });
        if (typeof (messageSplit[1]) !== 'undefined') {
            let volume;
            try {
                volume = parseInt(messageSplit[1]);
            } catch (e) {
                return msg.reply(this.t('generic.whole-num'));
            }
            if (isNaN(volume)) {
                return msg.reply(this.t('generic.nan'));
            }
            if (volume < 0) {
                return msg.reply(this.t('generic.negative', {number: volume}));
            }
            volume = volume / 100;
            this.v.setVolume(msg, volume);

        } else {
            return msg.reply(this.t('generic.nan'));
        }
    }
}
module.exports = Volume;