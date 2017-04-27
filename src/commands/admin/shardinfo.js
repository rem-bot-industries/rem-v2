/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let moment = require('moment');
let winston = require('winston');
let _ = require('lodash');
class GuildFinder extends Command {
    constructor ({t, mod}) {
        super();
        this.cmd = 'shardinfo';
        this.cat = 'admin';
        this.needGuild = false;
        this.hidden = true;
        this.t = t;
        this.accessLevel = 2;
        this.hub = mod.getMod('hub');
    }

    run (msg) {
        let time = Date.now();
        this.fetchData(msg).then(data => {
            // console.log(data);
            this.buildReply(msg, data, time);
        }).catch(err => {
            console.error(err);
            msg.channel.createMessage(`:x: \`${err}\``);
        });
    }

    fetchData (msg) {
        return new Promise((resolve, reject) => {
                this.hub.on(`action_resolved_${msg.id}`, (data) => {
                    if (data.err) reject(data.err);
                    resolve(data);
                });
                this.hub.executeAction('shard_info', msg.id);
            }
        )
            ;

    }

    buildReply (msg, data, time) {
        let endTime = Date.now();
        let total = endTime - time;
        let reply = {
            embed: {
                author: {
                    name: 'Shardstatus'
                },
                footer: {
                    text: `Total Latency: ${total}ms`
                },
                fields: this.buildShardData(data),
                color: 0x00ADFF
            }
        };
        msg.channel.createMessage(reply).then().catch(err => {
            // console.error(err);
        });
    }

    buildShardData (data) {
        let fields = [];
        let shardArray = this.splitShardsToPairs(data.shards);
        console.log(shardArray);
        console.log('DATA');
        for (let i = 0; i < shardArray.length; i++) {
            let name = ``;
            let content = ``;
            for (let x = 0; x < shardArray[i].length; x++) {
                let shard = shardArray[i][x];
                if (x === 0) {
                    name = `Shards ${shard.shardID}-${shard.shardID + shardArray[i].length - 1}`;
                }
                content += `\`\`\`
S: ${shard.shardID}
G: ${shard.guilds}
U: ${shard.users}
C: ${shard.channels}
V: ${shard.voice}
VA: ${shard.voice_active}
R: ${(shard.ram_usage / 1024 / 1024).toFixed(2)} MIB        
ID: ${shard.host}
\n\`\`\`
\n`;
            }
            fields.push({
                name,
                value: content,
                inline: false
            });
        }
        console.log(fields);
        return fields;
    }

    splitShardsToPairs (shards) {
        let pairArray = [];
        let tempPairArray = [];
        let i = 0;
        for (let key in shards) {
            if (shards.hasOwnProperty(key)) {
                let shard = shards[key];
                tempPairArray.push(shard);
                i++;
                if (i % 2 === 0) {
                    pairArray.push(tempPairArray);
                    tempPairArray = [];
                }
            }
        }
        return pairArray;
    }
}
module.exports = GuildFinder;