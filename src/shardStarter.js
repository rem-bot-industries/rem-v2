/**
 * Created by Julian/Wolke on 29.04.2017.
 */
const util = require('util');
global.Promise = require('bluebird');
global.TranslatableError = require('./structures/TranslatableError');
require('source-map-support').install({
    handleUncaughtExceptions: false
});
require('longjohn');
const winston = require('winston');
const version = require('../package.json').version;
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    'timestamp': true,
    'colorize': true
});
let config;
try {
    config = JSON.parse(process.env.CONFIG);
} catch (e) {
    winston.error(e);
    winston.error('Failed to parse config!');
    process.exit(1);
}
global.remConfig = config;

const Raven = require('raven');
if (!remConfig.no_error_tracking) {
    Raven.config(remConfig.sentry_token, {
        release: version,
        environment: remConfig.environment
    }).install(() => {
        winston.error('Oh no I died because of an unhandled error!');
        process.exit(1);
    });
    winston.info('Initializing error tracking!');
} else {
    winston.warn('No error tracking is used!');
}
let Shard = require('./Shard');
const erisOptions = {
    autoreconnect: true,
    compress: true,
    messageLimit: 0,
    disableEveryone: true,
    getAllUsers: false,
    firstShardID: parseInt(process.env.SHARD_ID),
    lastShardID: parseInt(process.env.SHARD_ID),
    maxShards: parseInt(process.env.SHARD_COUNT),
    disableEvents: ['TYPING_START', 'TYPING_STOP', 'GUILD_MEMBER_SPEAKING', 'MESSAGE_UPDATE', 'MESSAGE_DELETE']
};
let shardInstance = new Shard(Object.assign({eris: erisOptions}, config), Raven);
process.on('unhandledRejection', (reason, promise) => {
    if (!reason) return;
    winston.error(`Unhandled rejection: ${reason} - ${util.inspect(promise)}`);
});