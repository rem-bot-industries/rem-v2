/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
class SetPrefix extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'setPrefix';
        this.cat = 'moderation';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.g = mod.getMod('gm');
    }

    async run(msg) {
        let msgSplit = msg.content.split(' ');
        if (typeof (msgSplit[1]) !== 'undefined' && msg.mentions.length === 0) {
            try {
                await this.g.changePrefix(msg.channel.guild.id, msgSplit[1]);
                msg.channel.createMessage(`${msg.author.mention}, ${this.t('prefix.success', {
                    lngs: msg.lang,
                    prefix: msgSplit[1]
                })}`);
            } catch (e) {
                return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
            }
        } else {
            msg.channel.createMessage(`${msg.author.mention}, ${this.t('prefix.no-prefix', {lngs: msg.lang})}`);
        }
    }
}
module.exports = SetPrefix;