/**
 * Created by julia on 07.11.2016.
 */
var Command = require('../Objects/command');
var GuildManager = require('../modules/guildManager');
class SetLanguage extends Command {
    constructor(t) {
        super();
        this.cmd = "setLang";
        this.cat = "moderation";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.g = new GuildManager();
    }

    run(msg) {
        let msgSplit = msg.content.split(' ');
        if (typeof (msgSplit[1]) !== 'undefined') {
            if (this.checkLang(msgSplit[1], msg.lngs)) {
                this.g.changeLanguage(msg.guild.id, msgSplit[1], (err) => {
                    if (err) return msg.channel.sendMessage(this.t('generic.error', {lngs: msg.lang}));
                    msg.channel.sendMessage(this.t('set-lang.success', {lng: msgSplit[1], language: msgSplit[1]}));
                });
            } else {
                msg.channel.sendMessage(this.t('set-lang.unsupported', {lngs: msg.lang, languages: msg.lngs}));
            }
        } else {
            msg.channel.sendMessage(this.t('set-lang.no-lang', {lngs: msg.lang, languages: msg.lngs}))
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