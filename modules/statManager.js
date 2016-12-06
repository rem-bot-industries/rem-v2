/**
 * Created by julia on 01.12.2016.
 */
let statModel = require('../DB/stat');
let winston = require('winston');
class StatisticManager {
    constructor() {

    }

    logCmdStat(msg, cmd, allowed, reason) {
        let id = msg.guild ? msg.guild.id : undefined;
        let stat = new statModel({
            id: msg.id,
            userId: msg.author.id,
            guildId: id,
            run: allowed,
            reason: reason,
            cmd: cmd,
            content: msg.content
        });
        stat.save(err => {
            if (err) return winston.error(err);
        });
    }
}
module.exports = StatisticManager;