/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let AsciiTable = require('ascii-table');
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
                this.g.changeLanguage(msg.channel.guild.id, msgSplit[1], (err) => {
                    if (err) return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
                    msg.channel.createMessage(this.t('set-lang.success', {lng: msgSplit[1], language: msgSplit[1]}));
                });
            } else {
                msg.channel.createMessage(this.t('set-lang.unsupported', {lngs: msg.lang, languages: msg.lngs}));
            }
        } else {
            msg.channel.createMessage(`${this.t('set-lang.available-languages', {lngs: msg.lang})}
\`\`\`
${this.buildTable(msg)}
\`\`\`
`)
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

    buildTable(msg) {
        let table = new AsciiTable();
        table.setHeading(
            this.t('set-lang.shortcode', {lngs: msg.lang}),
            this.t('set-lang.english-name', {lngs: msg.lang}),
            this.t('set-lang.native-name', {lngs: msg.lang})
        );
        for (let i = 0; i < msg.lngs.length; i++) {
            let sc = msg.lngs[i];
            if (sc !== 'dev') {
                let native_name = this.t('generic.native-name', {lng: msg.lngs[i]}).trim();
                let english_name = this.t('generic.language-name-en', {lng: msg.lngs[i]});
                if (native_name === 'generic.native-name' || (native_name === this.t('generic.language-name-en', {lng: 'en'}) && sc !== 'en')) {
                    native_name = 'not defined';
                    english_name = 'not defined';
                }
                table.addRow(sc, english_name, native_name);
            }
        }
        return table.toString();
    }
}
module.exports = SetLanguage;