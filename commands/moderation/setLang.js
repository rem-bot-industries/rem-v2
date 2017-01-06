/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let GuildManager = require('../../modules/managed/guildManager');
class SetLanguage extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = "setLang";
        this.cat = "moderation";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.g = mod.getMod('gm');
    }

    run(msg) {
        let msgSplit = msg.content.split(' ');
        if (typeof (msgSplit[1]) !== 'undefined') {
            if (this.checkLang(msgSplit[1], msg.lngs)) {
                this.g.changeLanguage(msg.guild.id, msgSplit[1], (err) => {
                    if (err) return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
                    msg.channel.createMessage(this.t('set-lang.success', {lng: msgSplit[1], language: msgSplit[1]}));
                });
            } else {
                msg.channel.createMessage(this.t('set-lang.unsupported', {lngs: msg.lang, languages: msg.lngs}));
            }
        } else {
            msg.channel.createMessage(this.t('set-lang.no-lang', {lngs: msg.lang, languages: msg.lngs}))
        }
    }

    checkLang(lang, list) {
        let i = list.length;
        while (i--) {
            if (lang === list[i] && lang !== 'dev') {
                return true;
            }
        }
        return false;
    }
}
module.exports = SetLanguage;