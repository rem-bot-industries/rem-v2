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
const version = require('../package.json').version;
const winston = require('winston')
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.colorize(),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});
let config;
try {
    config = JSON.parse(process.env.CONFIG);
} catch (e) {
    logger.error(e)
    logger.error('Failed to parse config!')
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
    logger.info('Initializing error tracking!')
} else {
    logger.warn('No error tracking is used!')
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
