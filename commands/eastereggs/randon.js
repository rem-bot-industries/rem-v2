/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../Objects/command');
class Randon extends Command {
    constructor(t) {
        super();
        this.cmd = "randon";
        this.cat = "eastereggs";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.hidden = true;
    }

    run(msg) {
        let url = rem.users.find(u => u.id === '145162973910925312').avatarURL;
        console.log(url);
        let reply = {
            embed: {
                author: {
                    name: 'HcgRandon#4767',
                    icon_url: url
                },
                fields: [{value: "'cause fuck you, thats why", name: 'said:'}],
                footer: {text: "Randon 19.11.2016"},
                color: 0x00ADFF
            }
        };
        msg.channel.createMessage(reply);
    }
}
module.exports = Randon;