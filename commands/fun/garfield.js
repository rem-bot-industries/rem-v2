/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../structures/command');
let winston = require('winston');
let moment = require('moment');
class Garfield extends Command {
    constructor({t}) {
        super();
        this.cmd = "garfield";
        this.cat = "fun";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        let year = this.random(1990, 2016);
        let day = this.random(0, 366);
        let date = moment().year(year).dayOfYear(day);
        let dateFormat = date.format('YYYY-MM-DD');
        let dateYear = date.year();
        msg.channel.createMessage(`https://d1ejxu6vysztl5.cloudfront.net/comics/garfield/${dateYear}/${dateFormat}.gif`).then(messageSent => {

        }).catch(winston.info);
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
module.exports = Garfield;