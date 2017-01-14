/**
 * Created by julia on 13.01.2017.
 */
let Command = require('../../structures/command');
let adminId = require('../../config/main.json').owner_id;
class RestartShard extends Command {
    constructor({mod}) {
        super();
        this.cmd = "restartShard";
        this.cat = "admin";
        this.needGuild = false;
        this.accessLevel = 2;
        this.hidden = true;
        this.hub = mod.getMod('hub');
    }

    run(msg) {
        if (msg.author.id === adminId) {
            let id = msg.content.split(' ').splice(1);
            if (id) {
                let shardId = 0;
                try {
                    shardId = parseInt(id);
                } catch (e) {
                    return msg.channel.createMessage('Mate, the id was rip!');
                }
                if (isNaN(shardId)) {
                    return msg.channel.createMessage('Mate, the id was rip!');
                }
                this.restartShard(shardId - 1, msg);
            } else {
                this.restartShard(rem.options.firstShardID, msg);
            }
        }
    }

    restartShard(id, msg) {
        msg.channel.createMessage(`Restarting Shard ${id + 1}`);
        this.hub.emitRemote('shard_restart_request', {sid: id, by: msg.author.id, from: rem.options.firstShardID});
    }
}
module.exports = RestartShard;