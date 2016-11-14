/**
 * Created by EpicPick on 13.11.2016.
 */
var Command = require('../Objects/command');
class FlipCoin extends Command {
    constructor(t) {
        super();
        this.cmd = "flip";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        var rand = 1 + Math.floor(Math.random() * 100);
        let reply;
        let url;
        if (rand > 50) {
            url = 'https://rra.ram.moe/i/HJSEfDUbl';
            reply = 'flip.head';
        } else {
            url = 'https://rra.ram.moe/i/Byu2fPLWg';
            reply = 'flip.tail';
        }
        msg.channel.sendMessage(this.t(reply, {lngs: msg.lang, url: url}));
    }
}
module.exports = FlipCoin;