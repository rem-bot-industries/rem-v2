/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
class Dere extends Command {
    constructor({t}) {
        super();
        this.cmd = "dere";
        this.cat = "misc";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.deres = [
            "dandere",
            "deredere",
            "himedere",
            "kamidere",
            "kuudere",
            "mayadere",
            "yandere",
            "oujidere",
            "tsundere",
            "undere",
            "yangire"
        ]
    }

    run(msg) {
        let msgSplit = msg.content.split(' ').splice(1);
        if (msgSplit.length > 0) {
            let dere = this.matchDere(msgSplit);
            if (dere) {
                msg.channel.createMessage('```' + this.t(`dere.${dere}`, {lngs: msg.lang}) + '```');
            } else {
                let table = '```';
                for (let i = 0; i < this.deres.length; i++) {
                    table += this.deres[i] + '\n';
                }
                table += '```';
                msg.channel.createMessage(this.t('dere.no-dere', {lngs: msg.lang}) + table);
            }
        } else {
            let random = Math.floor(Math.random() * this.deres.length);
            try {
                msg.channel.createMessage('```' + this.t(`dere.${this.deres[random]}`, {lngs: msg.lang}) + '```');
            } catch (e) {
                msg.channel.createMessage('```' + this.t(`dere.${this.deres[0]}`, {lngs: msg.lang}) + '```');
            }
        }
    }

    matchDere(msgSplit) {
        for (let i = 0; i < this.deres.length; i++) {
            if (msgSplit[0].toLowerCase() === this.deres[i]) {
                return this.deres[i];
            }
        }
        return false;
    }
}
module.exports = Dere;