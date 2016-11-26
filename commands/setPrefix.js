/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../Objects/command');
let GuildManager = require('../modules/guildManager');
class SetPrefix extends Command {
    constructor(t) {
        super();
        this.cmd = "setPrefix";
        this.cat = "moderation";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.g = new GuildManager();
    }

    run(msg) {
        let msgSplit = msg.content.split(' ');
        if (typeof (msgSplit[1]) !== 'undefined' && msg.mentions.users.size === 0) {
            this.g.changePrefix(msg.guild.id, msgSplit[1], (err) => {
                if (err) return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
                msg.channel.createMessage(`${msg.author.mention},${this.t('prefix.success', {
                    lngs: msg.lang,
                    prefix: msgSplit[1]
                })}`);
            });
        } else {
            msg.channel.createMessage(`${msg.author.mention},${this.t('prefix.no-prefix', {lngs: msg.lang})}`);
        }
    }
}
module.exports = SetPrefix;