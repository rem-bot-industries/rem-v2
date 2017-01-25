/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
class Choose extends Command {
    constructor({t}) {
        super();
        this.cmd = "choose";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        let chooseString = msg.content.substring(msg.prefix.length);
        if (chooseString === '') return msg.channel.createMessage(this.t('choose.empty-choose', {lngs: msg.lang}));
        if (chooseString.endsWith(';')) {
            chooseString = chooseString.substring(0, string.length - 1);
        }
        let msgSplit = chooseString.split(' ').splice(1);
        msgSplit = msgSplit.join(' ').split(';');
        for (let i = 0; i < msgSplit.length; i++) {
            msgSplit[i] = msgSplit[i].trim();
        }
        let result = msgSplit[Math.floor(Math.random() * msgSplit.length)];
        msg.channel.createMessage(this.t('choose.success', {lngs: msg.lang, choice: result}));
    }
}
module.exports = Choose;