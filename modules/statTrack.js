/***
 * Created by julia on 01.11.2016.
 */
// var EventEmitter = require('eventemitter3');

var StatsD = require('node-dogstatsd').StatsD;
var dogstatsd = new StatsD();
var request = require('request');
const config = require('../config/main.json');
var EventEmitter = require('events');
/**
 * The stattrack engine
 * @extends EventEmitter
 *
 */
class StatTrack extends EventEmitter {
    /**
     * Create the stats engine.
     * @param {number} interval - the interval in seconds until the next update should be triggered
     */
    constructor(interval) {
        super();
        this.setMaxListeners(20);
        this.guilds = 0;
        this.users = 0;
        this.interval = setInterval(() => {
            this.update()
        }, interval * 1000)
    }

    /**
     * Updates the stats on carbonitex and bots.discord.pw
     */
    update() {
        this.emit('fetch');
        if (this.guilds > 0 && this.users > 0) {
            if (!config.beta) {
                dogstatsd.gauge('musicbot.guilds', this.guilds);
                dogstatsd.gauge('musicbot.users', this.users);
            }
            let requestOptions = {
                headers: {
                    Authorization: config.discord_bots_token
                },
                url: `https://bots.discord.pw/api/bots/${config.bot_id}/stats`,
                method: 'POST',
                json: {
                    'server_count': this.guilds
                }
            };
            request(requestOptions, (err, response, body) => {
                if (err) {
                    return this.emit('error', err);
                }
                this.emit('info', 'Stats Updated!');
                this.emit('info', body);
            });
            if (!config.beta) {
                let requestOptionsCarbon = {
                    url: 'https://www.carbonitex.net/discord/data/botdata.php',
                    method: 'POST',
                    json: {
                        'server_count': this.guilds,
                        'key': config.carbon_token
                    }
                };
                request(requestOptionsCarbon, (err, response, body) => {
                    if (err) {
                        return this.emit('error', err)
                    }
                    this.emit('info', 'Stats Updated Carbon!');
                    this.emit('info', body);
                });
            }
        }
    }

    /**
     * Save the guilds and the users
     * @param {number} guilds the number of the guilds
     * @param {number} users the number of the users
     */
    setStats(guilds, users) {
        this.guilds = guilds;
        this.users = users;
    }
}
module.exports = StatTrack;