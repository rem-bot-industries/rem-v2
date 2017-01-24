/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let moment = require('moment');
let winston = require('winston');
let _ = require("lodash");
class GuildFinder extends Command {
    constructor({t, mod}) {
        super();
        this.cmd = "shardinfo";
        this.cat = "admin";
        this.needGuild = false;
        this.hidden = true;
        this.t = t;
        this.accessLevel = 2;
        this.hub = mod.getMod('hub');
    }

    run(msg) {
        let time = Date.now();
        this.fetchData(msg).then(data => {
            // console.log(data);
            this.buildReply(msg, data, time);
        }).catch(err => {
            console.error(err);
            msg.channel.createMessage(`:x: \`${err}\``)
        });
    }

    fetchData(msg) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.hub.emitRemote('request_data', {
                sid: rem.options.firstShardID,
                id: msg.id,
                action: 'shard_info'
            });
            that.hub.on(`resolved_data_${msg.id}`, (data) => {
                if (data.err) reject(data.err);
                resolve(data);
            });
        });

    }

    buildReply(msg, data, time) {
        let reply = {
            embed: {
                author: {
                    name: `Shardstatus`
                },
                fields: this.buildShardData(msg, data, time),
                color: 0x00ADFF
            }
        };
        if (data.found) {
            reply.embed.image = {url: data.iconURL};
        }
        msg.channel.createMessage(reply).then().catch(err => {
            // console.error(err);
        });
    }

    buildShardData(msg, data, startTime) {
        let fields = [];
        let endTime = Date.now();
        let total = endTime - startTime;
        _.forIn(data, (value, key) => {
            let shard = endTime - value.responseDate;
            fields.push({
                name: `Shard: ${value.sid}`,
                value: `Total Diff: ${total}ms\nShard Diff: ${shard}ms`,
                inline: false
            });
        });
        return fields;
    }
}
module.exports = GuildFinder;