/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let minimist = require('minimist');
let winston = require('winston');
let async = require('async');
class RemoveMessages extends Command {
    constructor({t}) {
        super();
        this.cmd = "rm";
        this.cat = "moderation";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.msg = null;
        this.example = "!w.rm 100 -cr"
    }

    run(msg) {
        let messageSplit = msg.content.split(' ').splice(1);
        let args = minimist(messageSplit, {boolean: ['b', 'r', 'c', 'd', 'u'], string: ['i']});
        this.msg = msg;
        let limit = 0;
        try {
            limit = parseInt(args._[0]);
        } catch (e) {

        }
        args._.splice(1);
        // console.log(args);
        // console.log(msg);
        if (limit > 1 && !isNaN(limit)) {
            this.getMessages(msg, limit, (err, msgs) => {
                if (err) return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
                this.filterMessages(msgs, args, (err, msgs) => {
                    if (err) return msg.channel.createMessage(this.t('rm.error', {lngs: msg.lang}));
                    if (msgs.length > 0) {
                        this.deleteMessages(msgs, (err) => {
                            if (err) return msg.channel.createMessage(this.t('rm.error', {lngs: msg.lang}));
                            msg.channel.createMessage(this.t('rm.success', {
                                number: msgs.length,
                                lngs: msg.lang
                            })).then(sendedMsg => {
                                if (args.d) {
                                    msg.delete();
                                    sendedMsg.delete();
                                }
                            });
                        });
                    } else {
                        msg.channel.createMessage(this.t('rm.nothing-found', {lngs: msgs.length}));
                    }
                });
            });
        } else {
            msg.channel.createMessage(this.t('rm.no-limit', {lngs: msg.lang}))
        }
    }

    filterMessages(msgs, args, cb) {
        let filtered = [];
        async.each(msgs, (msg, cb) => {
            let done = false;
            if (args.b && !done) {
                if (msg.author.bot) {
                    filtered.push(msg.id);
                    done = true;
                    async.setImmediate(() => {
                        return cb();
                    });
                }
            }
            if (args.r && !done) {
                if (msg.author.id === rem.user.id) {
                    filtered.push(msg.id);
                    done = true;
                    async.setImmediate(() => {
                        return cb();
                    });
                }
            }
            if (args.c && !done) {
                if (msg.content.startsWith(this.msg.prefix)) {
                    filtered.push(msg.id);
                    done = true;
                    async.setImmediate(() => {
                        return cb();
                    });
                }
            }
            if (args.u && !done) {
                let users = this.msg.mentions;
                for (let i = 0; i < users.length; i++) {
                    if (msg.author.id === users[i].id) {
                        done = true;
                        filtered.push(msg.id);
                        async.setImmediate(() => {
                            return cb();
                        });
                    }
                }
            }
            if (!args.c && !args.b && !args.r && !args.u) {
                filtered.push(msg.id);
                done = true;
                async.setImmediate(() => {
                    return cb();
                });
            }
            if (!done) {
                async.setImmediate(() => {
                    return cb();
                });
            }
        }, (err) => {
            if (err) return cb(err);
            return cb(null, filtered);
        })
    }

    getMessages(msg, limit, cb) {
        if (limit < 2 || limit > 100) {
            return cb('rm.over-limit');
        }
        rem.getMessages(msg.channel.id, limit, msg.id).then(msgs => {
            cb(null, msgs);
        }).catch(err => {
            winston.error(err);
            cb('rm.error');
        });
    }

    deleteMessages(msgs, cb) {
        rem.deleteMessages(this.msg.channel.id, msgs).then(() => {
            cb();
        }).catch(err => {
            winston.error(err);
            cb('rm.error');
        });
    }
}
module.exports = RemoveMessages;