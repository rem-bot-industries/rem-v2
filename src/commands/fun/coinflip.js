/**
 * Created by EpicPick on 13.11.2016.
 */
let Command = require('../../structures/command');
class FlipCoin extends Command {
    constructor({t}) {
        super();
        this.cmd = "coin";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        let rand = 1 + Math.floor(Math.random() * 100);
        let reply;
        let url;
        if (rand > 50) {
            url = 'https://rra.ram.moe/i/HJSEfDUbl';
            reply = 'flip.head';
        } else {
            url = 'https://rra.ram.moe/i/Byu2fPLWg';
            reply = 'flip.tail';
        }
        msg.channel.createMessage(this.t(reply, {lngs: msg.lang, url: url}));
    }
}
module.exports = FlipCoin;