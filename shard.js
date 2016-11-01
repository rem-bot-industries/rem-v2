/**
 * Created by julia on 01.11.2016.
 */
const winston = require('winston');
const commando = require('discord.js-commando');
const config = require('./config/main.json');
const client = new commando.Client({
    owner: config.owner_id,
    commandPrefix: '!w.',
    unknownCommandResponse: false
});
let shard = {id: process.env.SHARD_ID, count: process.env.SHARD_COUNT};
client.on('error', winston.error);
client.on('warn', winston.warn);
// client.on('debug', winston.info);
client.on('ready', () => {
    winston.log(`Client ready, logged in as ${client.user.username}#${client.user.discriminator} shard:${shard.id}`);
});
client.on('disconnect', () => {
    winston.warn('Disconnected!');
});
client.on('reconnect', () => {
    winston.warn('Reconnecting!');
});
client.login(config.token);