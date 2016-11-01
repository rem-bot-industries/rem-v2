/**
 * Created by julia on 01.11.2016.
 */
const commando = require('discord.js-commando');
const config = require('./config/main.json');
const client = new commando.Client({
    owner: config.owner_id,
    commandPrefix: '!w.',
    unknownCommandResponse: false
});
let shard = {id: process.env.SHARD_ID, count: process.env.SHARD_COUNT};
client.on('error', console.error);
client.on('warn', console.warn);
client.on('debug', console.log);
client.on('ready', () => {
    console.log(`Client ready, logged in as ${client.user.username}#${client.user.discriminator} shard:${shard.id}`);
});
client.on('disconnect', () => {
    console.warn('Disconnected!');
});
client.on('reconnect', () => {
    console.warn('Reconnecting!');
});
client.login(config.token);