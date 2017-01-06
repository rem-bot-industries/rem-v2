/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let AsciiTable = require('ascii-table');
/**
 * The vote skip command
 * @extends Command
 *
 */
class ForceSkip extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     */
    constructor({t, v}) {
        super();
        this.cmd = "skip";
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.msg = null;
        this.accessLevel = 0;
        this.inprogress = {};
    }

    run(msg) {
        if (typeof(this.inprogress[msg.channel.id]) !== 'undefined') {
            return msg.channel.createMessage(this.t('vskip.in-prog', {lngs: msg.lang, prefix: msg.prefix}));
        }
        this.v.once(`${msg.id}_error`, (err) => {
            this.v.removeAllListeners();
            msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
        });
        this.v.once(`${msg.id}_skipped`, (song) => {
            this.v.removeAllListeners();
            msg.channel.createMessage(this.t('skip.success', {lngs: msg.lang, title: song.title}));
        });
        if (msg.member.voiceState.channelID && rem.voiceConnections.get(msg.guild.id) && msg.member.voiceState.channelID === rem.voiceConnections.get(msg.guild.id).channelID) {
            let channelID = msg.member.voiceState.channelID;
            let channel = msg.guild.channels.find((c) => c.id === channelID);
            // console.log(channel.voiceMembers);
            console.log(channel.voiceMembers.size);
            if (channel.voiceMembers.size > 2) {
                this.msg = msg;
                this.startVoteskip(msg, channel);
            } else {
                console.log('Force!');
                this.v.forceSkip(msg);
            }
        }
    }

    startVoteskip(msg, channel) {
        this.inprogress[msg.channel.id] = {inprogress: true, id: msg.channel.id};
        let size = channel.voiceMembers.size - 1;
        let voted = [{id: msg.author.id, name: msg.member.nick ? msg.member.nick : msg.author.username}];
        let table = new AsciiTable();
        table.addRow(msg.author.username + '#' + msg.author.discriminator);
        let percentage = voted.length / size * 100;
        msg.channel.createMessage(this.t('vskip.vote', {
            lngs: this.msg.lang,
            prefix: this.msg.prefix,
            perct: percentage,
            needed: 50,
            table: table.toString()
        })).then(voteMsg => {
            let collector = msg.CON.addCollector(msg.channel.id, {});
            setTimeout(() => {
                delete this.inprogress[msg.channel.id];
            }, 1000 * 60);
            collector.on('message', (msg) => {
                if (msg.content !== `${this.msg.prefix}yes` && (msg.content === `${this.msg.prefix}fskip` || msg.content === `${this.msg.prefix}play`)) {
                    collector.stop();
                    voteMsg.delete();
                    delete this.inprogress[msg.channel.id];
                    this.v.removeAllListeners();
                } else if (msg.content === `${this.msg.prefix}yes`) {
                    if (this.checkVoted(msg, voted)) {
                        size = channel.voiceMembers.size;
                        voted.push({id: msg.author.id, name: msg.member.nick ? msg.member.nick : msg.author.username});
                        table.addRow(msg.author.username + '#' + msg.author.discriminator);
                        percentage = voted.length / size * 100;
                        if (percentage === 50 || percentage > 50) {
                            collector.stop();
                            voteMsg.delete();
                            delete this.inprogress[msg.channel.id];
                            this.v.forceSkip(msg);
                        } else {
                            voteMsg.edit(this.t('vskip.vote', {
                                lngs: this.msg.lang,
                                prefix: this.msg.prefix,
                                perct: percentage,
                                needed: 50,
                                table: table.toString()
                            }));
                        }
                    } else {
                        msg.channel.createMessage(this.t('vskip.dup', {lngs: msg.lang}));
                    }

                }
            });
        });

    }


    checkVoted(msg, voted) {
        for (let i = 0; i < voted.length; i++) {
            if (msg.author.id === voted[i].id) {
                return false;
            }
        }
        return true;
    }
}
module.exports = ForceSkip;