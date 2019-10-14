/**Require the dependencies*/
const child_process = require('child_process');
//require the logger and modify it, to look cool
const winston = require('winston');
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
const version = require('./../package.json').version;
process.title = "Rem v" + version;
const util = require('util');
logger.info('Thanks for using Rem v2! You\'re now using the Rem client, a defunct Discord bot which provides ' +
             "multiple functions like music, moderation and fun. Please take in mind that the client is " +
             "provided as it is and we are no longer giving support. Run it at your own risk~ uwu");
const configTemplate = require('./structures/template.js');
let wsWorker;
/**
 * Use different configs based on the environment (used for easy docker run)
 */
let loader = require('docker-config-loader');
let config;
try {
    config = loader({secretName: 'secret_name', localPath: './config/main.json'});
} catch (e) {
    logger.error(e)
    logger.error('Failed to require config!')
    process.exit(1);
}
global.remConfig = config;
if (remConfig.use_ws) {
    wsWorker = require('./ws/worker');
}
require('longjohn');
if (!process.env.environment && !remConfig.environment) {
    winston.warn('No environment config was found, setting the environment config to development!');
    remConfig.environment = 'development';
}
if (!process.env.statsd_host && !remConfig.statsd_host) {
    winston.warn('No environment/config setting named statsdhost was found, setting the statsdhost config to localhost!');
    remConfig.statsdhost = 'localhost';
}
for (let key in configTemplate) {
    if (configTemplate.hasOwnProperty(key)) {
        if (typeof (remConfig[key]) === 'undefined') {
            if (configTemplate[key].required) {
                throw new Error(`The required config key ${key} is missing!`);
            } else {
                winston.warn(`The optional config key ${key} is missing!`)
            }
        }
    }
}
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
let client;
if (remConfig.use_ws) {
    let wsService = new wsWorker({connectionUrl: `ws://${remConfig.master_hostname}`});
    wsService.on('message', (msg) => {
        if (client) {
            client.send(JSON.stringify(msg))
        }
    });
    wsService.on('ws_ready', (data) => {
        if (client) {
            // console.log(data);
        }
    });
    wsService.on('ws_reshard', (data) => {
        if (client) {
            try {
                client.removeAllListeners();
                client.kill();
            } catch (e) {
                console.error(e);
            }
            console.log(`Restarting Client for Resharding!`);
        }
        const env = {SHARD_ID: data.sid, SHARD_COUNT: data.sc, CONFIG: JSON.stringify(config)};
        client = child_process.fork('./shardStarter.js', {options: {env: Object.assign(process.env, env)}});
        client.on('exit', (code, status) => {
            console.log(code, status);
            process.exit(code);
        });
        client.on('message', (msg) => {
            try {
                msg = JSON.parse(msg);
                wsService.processMessage(msg);
            } catch (e) {
                console.error(e);
            }
        })

    });
    wsService.on('shutdown_client', () => {
        if (client) {
            try {
                client.removeAllListeners();
                client.kill();
            } catch (e) {
                console.error(e);
            }
            process.exit(1);
        }
    })
} else {
    const env = {SHARD_ID: 0, SHARD_COUNT: 1, CONFIG: JSON.stringify(config)};
    client = child_process.fork('./shardStarter.js', {options: {env: Object.assign(process.env, env)}});
    client.on('exit', (code, status) => {
        console.log(code, status);
    });

}
logger.info(`Client Started!`)
process.once('SIGINT', () => {
    logger.error('Received SIGINT')
    if (client) {
        try {
            client.kill();
        } catch (e) {
            console.error(e);
        }
    }
    process.exit(0);
});
process.on('unhandledRejection', (reason, promise) => {
    if (!reason) return;
    winston.error(`Unhandled rejection: ${reason} - ${util.inspect(promise)}`);
});
// Now look at this net
function net() { // that I just found!
    // When I say go,
    // be ready to throw!

    // GO!
    throw net;
} // Urgh, let's try somthing else

