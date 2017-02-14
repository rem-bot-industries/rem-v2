/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let winston = require('winston');
let Selector = require('../../structures/selector');
let _ = require('lodash');
let track_error = !remConfig.no_error_tracking;
/**
 * The play command
 * plays a song duh.
 * @extends Command
 *
 */
class Play extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     * @param mod The module manager
     */
    constructor({t, v, mod}) {
        super();
        this.cmd = 'play';
        this.cat = 'music';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.r = mod.getMod('raven');
        this.accessLevel = 0;
    }

    run(msg) {
        let msgSplit = msg.content.split(' ').splice(1);
        if (msgSplit.length === 0) return msg.channel.createMessage(this.t('qa.empty-search', {lngs: msg.lang}));
        let uwu = this.checkNext(msgSplit);
        let next = uwu.next;
        msgSplit = uwu.msgSplit;
        msg.content = msgSplit.join(' ').trim();
        this.v.addToQueue(msg, !next, next).then(result => {
            switch (result.type) {
                case 'added':
                    if (next) return msg.channel.createMessage(this.t('play.next', {
                        song: result.data.title,
                        lngs: msg.lang
                    }));
                    msg.channel.createMessage(this.t('play.success', {song: result.data.title, lngs: msg.lang}));
                    return;
                case 'search_result':
                    this.searchResult(msg, result.data);
                    return;

            }
        }).catch(err => {
            console.error(err);
            if (track_error) {
                if (typeof(err) === 'object') {
                    err = err.err;
                }
                if (err !== 'joinVoice.no-voice' || err !== 'joinVoice.error' || err !== 'generic.error') {
                    this.r.captureException(err, {
                        extra: {
                            userId: msg.author.id,
                            guildId: msg.channel.guild.id,
                            msg: msg.content,
                            msgId: msg.id
                        }
                    });
                }

            }
            msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
        });
    }

    checkNext(msgSplit) {
        let next = false;
        let index = _.indexOf(msgSplit, '-next');
        if (index > -1) {
            _.pull(msgSplit, '-next');
            next = true;
        }
        return {next, msgSplit};
    }

    searchResult(msg, results) {
        let selector = new Selector(msg, results, this.t, (err, number) => {
            if (err) {
                return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
            }
            msg.content = `!w.play https://youtube.com/watch?v=${results[number - 1].id}`;
            this.run(msg);
        });
    }
}
module.exports = Play;