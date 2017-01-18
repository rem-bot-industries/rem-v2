/**
 * Created by julia on 18.01.2017.
 */
let Command = require('../../structures/command');
class getPermNode extends Command {
    constructor({t}) {
        super();
        this.cmd = "getNode";
        this.cat = "permission";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        let msgSplit = msg.content.split(' ');
        if (typeof (msgSplit[1]) !== 'undefined') {
            if (msgSplit[1] === 'cleverbot') {
                return msg.channel.createMessage(this.t('get-node.success', {
                    lngs: msg.lang,
                    node: `fun.cleverbot`,
                    category: 'fun'
                }));
            }
            let cmd = msg.cmds[msgSplit[1]];
            if (cmd) {
                if (cmd.cat !== 'admin') {
                    msg.channel.createMessage(this.t('get-node.success', {
                        lngs: msg.lang,
                        node: `${cmd.cat}.${cmd.cmd}`,
                        category: cmd.cat
                    }));
                } else {
                    msg.channel.createMessage(this.t('get-node.not-found', {lngs: msg.lang}));
                }
            } else {
                msg.channel.createMessage(this.t('get-node.not-found', {lngs: msg.lang}));
            }
        } else {
            msg.channel.createMessage(this.t('get-node.no-args', {lngs: msg.lang}));
        }
    }
}
module.exports = getPermNode;