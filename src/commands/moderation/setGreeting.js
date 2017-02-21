/**
 * Created by Julian/Wolke on 19.02.2017.
 */
let Command = require('../../structures/command');
class SetLanguage extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = 'setGreeting';
        this.cat = 'moderation';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.sm = mod.getMod('sm');
        this.Raven = mod.getMod('raven');
    }

    async run(msg) {
        try {
            let greeting = msg.content.split(' ').splice(1).join(' ');
            let greetingText = await this.sm.get(msg.channel.guild.id, 'guild', 'greeting.text');
            let greetingChannelId = await this.sm.get(msg.channel.guild.id, 'guild', 'greeting.channel');
            if (!greeting) {
                if (greetingText && greetingChannelId) {
                    let channel = msg.channel.guild.channels.find(c => c.id === greetingChannelId.value);
                    return msg.channel.createMessage(this.t('greeting.set-greeting', {
                        lngs: msg.lang,
                        text: greetingText.value,
                        channel: channel ? `#${channel.name}` : 'deleted-channel',
                        prefix: msg.prefix
                    }));
                }
                return msg.channel.createMessage(this.t('greeting.no-set-greeting', {
                    lngs: msg.lang,
                    prefix: msg.prefix
                }));
            }
            if (greeting === 'reset') {
                await this.sm.remove(greetingText);
                await this.sm.remove(greetingChannelId);
                return msg.channel.createMessage(this.t('greeting.reset-greeting', {
                    lngs: msg.lang,
                    prefix: msg.prefix
                }));
            }
            if (greetingText && greetingChannelId) {
                greetingText.value = greeting;
                greetingChannelId.value = msg.channel.id;
                await this.sm.set(greetingText);
                await this.sm.set(greetingChannelId);
            } else {
                await this.sm.create(msg.channel.guild.id, 'guild', 'greeting.text', greeting);
                await this.sm.create(msg.channel.guild.id, 'guild', 'greeting.channel', msg.channel.id);
            }
            return msg.channel.createMessage(this.t('greeting.success', {
                lngs: msg.lang,
                text: greeting
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