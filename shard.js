/**
 * Created by julia on 01.11.2016.
 */
const winston = require('winston');
const commando = require('discord.js-commando');
const config = require('./config/main.json');
var path = require('path');
const client = new commando.Client({
    owner: config.owner_id,
    commandPrefix: '!w.',
    unknownCommandResponse: false
});
let shard = {id: process.env.SHARD_ID, count: process.env.SHARD_COUNT};
client.on('error', winston.error)
    .on('warn', winston.warn)
    .on('debug', winston.info)
    .on('ready', () => {
        winston.info(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
    })
    .on('disconnect', () => {
        winston.warn('Disconnected!');
    })
    .on('reconnect', () => {
        winston.warn('Reconnecting...');
    })
    .on('commandError', (cmd, err) => {
        if (err instanceof commando.FriendlyError) return;
        winston.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
    })
    .on('commandBlocked', (msg, reason) => {
        winston.info(`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
    })
    .on('commandPrefixChange', (guild, prefix) => {
        winston.info(`
			Prefix changed to ${prefix || 'the default'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    })
    .on('commandStatusChange', (guild, command, enabled) => {
        winston.info(`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    })
    .on('groupStatusChange', (guild, group, enabled) => {
        winston.info(`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    });

client.registry
    .registerGroup('general', 'General')
    .registerDefaults();
client.login(config.token);
//uwu
//
//.registerCommandsIn(path.join(__dirname, 'commands'));