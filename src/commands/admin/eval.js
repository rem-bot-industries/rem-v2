/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let adminId = process.env.owner_id;
class EvalCode extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'eval';
        this.cat = 'admin';
        this.needGuild = false;
        this.hidden = true;
        this.t = t;
        this.accessLevel = 2;
        this.hub = mod.getMod('hub');
        this.mod = mod;
    }

    run(msg) {
        if (msg.author.id === adminId) {
            let content = msg.content.substring(`${msg.prefix}eval`.length);
            if (content) {
                try {
                    let result = eval(content);
                    msg.channel.createMessage(`\`\`\`javascript\n${result}\`\`\``);
                } catch (e) {
                    msg.channel.createMessage(`\`\`\`javascript\n${e}\`\`\``);
                }
            }
        }
    }
}
module.exports = EvalCode;