/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../Objects/command');
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
        let volume;
        let messageSplit = msg.content.split(' ');
        this.v.once('error', (err) => {
            console.log(err);
            msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        });
        this.v.once('success', () => {
            msg.channel.createMessage(this.t('voice.success-volume', {lngs: msg.lang, volume: volume}));
        });
        if (typeof (messageSplit[1]) !== 'undefined') {
            try {
                volume = parseInt(messageSplit[1]);
            } catch (e) {
                return msg.channel.createMessage(`${msg.author.mention},${this.t('generic.whole-num')}`);
            }
            if (isNaN(volume)) {
                return msg.channel.createMessage(`${msg.author.mention},${this.t('generic.nan')}`);
            }
            if (volume < 0) {
                return msg.channel.createMessage(`${msg.author.mention},${this.t('generic.negative', {number: volume})}`);
            }
            if (volume > 200) {
                return msg.channel.createMessage(`${msg.author.mention},${this.t('voice.too-much', {number: volume})}`);
            }
            volume = volume / 100;
            this.v.setVolume(msg, volume);

        } else {
            return msg.channel.createMessage(`${msg.author.mention},${this.t('generic.nan')}`);
        }
    }
}
module.exports = Volume;