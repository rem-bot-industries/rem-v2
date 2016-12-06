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
        let reply = {
            embed: {
                author: {
                    name: 'HcgRandon#4767',
                    icon_url: 'https://discordapp.com/api/v6/users/145162973910925312/avatars/b396756e0f91db70a9c7fdcde2018d90.jpg'
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