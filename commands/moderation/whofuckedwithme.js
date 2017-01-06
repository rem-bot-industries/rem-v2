/**
 * Created by julia on 24.11.2016.
 */
let Command = require('../../structures/command');
let msgModel = require('../../DB/message');
class WhoFuckedWithMe extends Command {
    constructor({t}) {
        super();
        this.cmd = "wfwm";
        this.cat = "moderation";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.hidden = true;
    }

    run(msg) {
        let content = msg.content.substr(msg.prefix.length + this.cmd.length).trim();
        msgModel.findOne({id: content}, (err, MSG) => {
            if (err) return msg.channel.createMessage(MSG);
            if (MSG) {
                let reply = {
                    embed: {
                        author: {
                            name: MSG.name
                        },
                        fields: [{value: MSG.content, name: 'wrote:'}],
                        footer: {text: `${MSG.time} - ${MSG.name}`},
                        color: 0x00ADFF
                    }
                };
                msg.channel.createMessage(reply);
            }
        });
    }
}
module.exports = WhoFuckedWithMe;