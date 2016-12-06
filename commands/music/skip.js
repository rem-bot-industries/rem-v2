/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../Objects/command');
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
    constructor(t, v) {
        super();
        this.cmd = "skip";
        this.cat = "music";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.msg = null;
        this.accessLevel = 0;
    }

    run(msg) {
        this.v.once('error', (err) => {
            this.v.removeAllListeners();
            msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
        });
        this.v.once('skipped', (song) => {
            this.v.removeAllListeners();
            msg.channel.createMessage(this.t('skip.success', {lngs: msg.lang, title: song.title}));
        });
        if (msg.member.voiceState.channelID && rem.voiceConnections.get(msg.guild.id) && msg.member.voiceState.channelID === rem.voiceConnections.get(msg.guild.id).channelID) {
            let channelID = msg.member.voiceState.channelID;
            let channel = msg.guild.channels.find((c) => c.id === channelID);
            // console.log(channel.voiceMembers);
            console.log(channel.voiceMembers.size);
            if (channel.voiceMembers.size > 0) {
                this.msg = msg;
                this.startVoteskip(msg, channel.voiceMembers.size);
            } else {
                console.log('Force!');
                this.v.forceSkip(msg);
            }
        }
    }

    startVoteskip(msg, size) {
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
            collector.on('message', (msg) => {
                if (msg.content !== `${this.msg.prefix}yes` && msg.content.startsWith(this.msg.prefix)) {
                    collector.stop();
                    voteMsg.delete();
                    this.v.removeAllListeners();
                } else {
                    voted.push({id: msg.author.id, name: msg.member.nick ? msg.member.nick : msg.author.username});
                    table.addRow(msg.author.username + '#' + msg.author.discriminator);
                    percentage = voted.length / size * 100;
                    if (percentage === 50 || percentage > 50) {
                        collector.stop();
                        voteMsg.delete();
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
                }
            });
        });
        //&& this.checkVoted(msg, voted))
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