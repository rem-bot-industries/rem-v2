/**
 * Created by julia on 01.12.2016.
 */
let Manager = require('../../structures/manager');
let statModel = require('../../DB/stat');
let winston = require('winston');
class StatisticManager extends Manager {
    constructor() {
        super();
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
module.exports = {class: StatisticManager, deps: [], async: false, shortcode: 'stm'};