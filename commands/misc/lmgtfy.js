/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../Objects/command');
class Lmgtfy extends Command {
    constructor(t) {
        super();
        this.cmd = "lmg";
        this.cat = "misc";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        let content = msg.content.substr(msg.prefix.length + this.cmd.length).trim();
        if (content !== '') {
            msg.channel.createMessage(`<http://lmgtfy.com/?q=${encodeURI(content)}>`);
        } else {
            msg.channel.createMessage(this.t('generic.empty-search', {lngs: msg.lang}))
        }
    }
}
module.exports = Lmgtfy;