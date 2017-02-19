/**
 * Created by Julian/Wolke on 19.02.2017.
 */
let Command = require('../../structures/command');
class SetLanguage extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'setFarewell';
        this.cat = 'moderation';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.sm = mod.getMod('sm');
        this.Raven = mod.getMod('raven');
    }

    async run(msg) {
        try {
            let farewell = msg.content.split(' ').splice(1).join(' ');
            let farewellText = await this.sm.get(msg.channel.guild.id, 'guild', 'farewell.text');
            let farewellChannelId = await this.sm.get(msg.channel.guild.id, 'guild', 'farewell.channel');
            if (!farewell) {
                if (farewellText && farewellChannelId) {
                    let channel = msg.channel.guild.channels.find(c => c.id === farewellChannelId.value);
                    return msg.channel.createMessage(this.t('farewell.set-farewell', {
                        lngs: msg.lang,
                        text: farewellText.value,
                        channel: channel ? `#${channel.name}` : 'deleted-channel',
                        prefix: msg.prefix
                    }));
                }
                return msg.channel.createMessage(this.t('farewell.no-set-farewell', {
                    lngs: msg.lang,
                    prefix: msg.prefix
                }));
            }
            if (farewell === 'reset') {
                await this.sm.remove(farewellText);
                await this.sm.remove(farewellChannelId);
                return msg.channel.createMessage(this.t('farewell.reset-farewell', {
                    lngs: msg.lang,
                    prefix: msg.prefix
                }));
            }
            if (farewellText && farewellChannelId) {
                farewellText.value = farewell;
                farewellChannelId.value = msg.channel.id;
                await this.sm.set(farewellText);
                await this.sm.set(farewellChannelId);
            } else {
                await this.sm.create(msg.channel.guild.id, 'guild', 'farewell.text', farewell);
                await this.sm.create(msg.channel.guild.id, 'guild', 'farewell.channel', msg.channel.id);
            }
            return msg.channel.createMessage(this.t('farewell.success', {
                lngs: msg.lang,
                text: farewell
            }));
        } catch (e) {
            if (!remConfig.no_error_tracking) {
                this.Raven.captureException(e);
            }
            console.error(e);
            return msg.channel.createMessage(this.t('generic.error', {
                lngs: msg.lang
            }));
        }
    }
}
module.exports = SetLanguage;