/**
 * Created by Julian/Wolke on 07.11.2016.
 */
const Command = require('../../structures/command');
const adminId = remConfig.owner_id;
const util = require('util');
class EvalCode extends Command {
    constructor ({t, mod}) {
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

    async run (msg) {
        if (msg.author.id === adminId) {
            let content = msg.content.substring(`${msg.prefix}eval`.length);
            if (content) {
                try {
                    let result = eval(content);
                    result = await result;
                    if (result.toString() === '[object Object]') {
                        result = util.inspect(result);
                    }
                    await msg.channel.createMessage(`\`\`\`javascript\n${result.toString().replace(remConfig.token, 'nice try')}\`\`\``);
                } catch (e) {
                    msg.channel.createMessage(`\`\`\`javascript\n${e}\`\`\``);
                }
            }
        }
    }
}
module.exports = EvalCode;