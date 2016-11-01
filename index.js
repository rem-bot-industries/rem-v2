/**
 * Created by julia on 01.11.2016.
 */
let Discord = require('discord.js');
let config = require('./config/main.json');
let StatTrack = require('./modules/statTrack');
let ShardingManager = new Discord.ShardingManager('./shard.js', {}, config.shards, true);
ShardingManager.spawn(config.shards, 5000).then(shards => {
    console.log('Spawned Shards!');
    let stats = new StatTrack(60*60*24);
    stats.on('fetch', function (cb) {
        console.log('fetch!');
        ShardingManager.fetchClientValues('guilds.size').then(results => {
            ShardingManager.broadcastEval('var x=0;this.guilds.map(g => {x += g.memberCount});x;').then(res => {
                let users = res.reduce((a, b) => a + b);
                let guilds = results.reduce((prev, val) => prev + val, 0);
                stats.setStats(guilds, users);
            }).catch(err => {

            });
        }).catch(err => {

        });
    });
    stats.on('error',(err) => {
        console.error(err);
    });
    stats.on('info',(info) => {
        console.log('INFO:');
        console.log(info);
    });
}).catch(console.error);