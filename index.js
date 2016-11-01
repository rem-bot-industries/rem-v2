let Discord = require('discord.js');
let config = require('./config/main.json');
let StatTrack = require('./modules/statTrack');
const winston = require('winston');
let ShardingManager = new Discord.ShardingManager('./shard.js', {}, config.shards, true);
ShardingManager.spawn(config.shards, 5000).then(shards => {
    winston.info('Spawned Shards!');
    let stats = new StatTrack(60 * 60 * 24);
    stats.on('fetch', () => {
        winston.info('fetch!');
        ShardingManager.fetchClientValues('guilds.size').then(results => {
            ShardingManager.broadcastEval('var x=0;this.guilds.map(g => {x += g.memberCount});x;').then(res => {
                let users = res.reduce((a, b) => a + b);
                let guilds = results.reduce((prev, val) => prev + val, 0);
                stats.setStats(guilds, users);
            }).catch(err => {
                winston.error(err);
            });
        }).catch(err => {
            winston.error(err);
        });
    });
    stats.on('error', (err) => {
        winston.error(err);
    });
    stats.on('info', (info) => {
        winston.info(info)
    });
}).catch(winston.error);