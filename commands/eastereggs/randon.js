/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
class Randon extends Command {
    constructor({t}) {
        super();
        this.cmd = "randon";
        this.cat = "eastereggs";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.hidden = true;
    }

    run(msg) {
        let user = rem.users.find(u => u.id === '145162973910925312');
        let url = user ? user.avatarURL : 'https://images-ext-2.discordapp.net/.eJwFwVEOwiAMANC7cABKC4yyy5hSjNuijgDzx3h33_uaqz_NarY521gBtL5t3YeevUprVs8XyEem9AEYIi6Uk8_oMkWPBHK7B06EgVkVBaXEUlxIzAWdeEK2R3uY3x-Blh53.Yn90NTHop7kj2cziyctpgywOIoM';
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