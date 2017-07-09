/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let Selector = require('../../structures/selector');
let track_error = !remConfig.no_error_tracking;
/**
 * The addToQueueCommand
 * @extends Command
 *
 */
class AddToQueue extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     * @param mod
     */
    constructor({t, v, mod}) {
        super();
        this.cmd = 'qa';
        this.cat = 'music';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.r = mod.getMod('raven');
        this.accessLevel = 0;
    }

    async run(msg) {
        msg.content = msg.content.split(' ').splice(1).join(' ');
        if (msg.content === '') {
            return msg.channel.createMessage(this.t('generic.empty-search', {lngs: msg.lang}));
        }
        try {
            let res = await this.v.addToQueue(msg, false);
            if (Object.prototype.toString.call(res) === '[object Array]') {
                return this.searchResult(msg, res);
            } else {
                msg.channel.createMessage(this.t('qa.success', {
                    song: res.title,
                    lngs: msg.lang,
                    user: `${msg.author.username}#${msg.author.discriminator}`
                }));
            }
        } catch (err) {
            if (err instanceof TranslatableError) {
                console.error(err);
                msg.channel.createMessage(this.t(err instanceof TranslatableError ? err.t : 'generic.error', {lngs: msg.lang}));
            } else {
                if (track_error) {
                    this.r.captureException(err, {
                        extra: {
                            userId: msg.author.id,
                            guildId: msg.channel.guild.id,
                            msg: msg.content,
                            msgId: msg.id
                        }
                    });
                }
                // console.error(err);
                console.error(err);
                msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
            }
        }
    }

    searchResult(msg, results) {
        let selector = new Selector(msg, results, this.t, (err, number) => {
            if (err) {
                return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
            }
            msg.content = `!w.qa ${results[number - 1].url}`;
            this.run(msg);
        });
    }
}
module.exports = AddToQueue;