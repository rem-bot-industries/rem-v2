/**Require the dependencies*/
//uwu
const winston = require('winston');
const util = require('util');
const configTemplate = require('./vault/template.js');
require('longjohn');
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    'timestamp': true,
    'colorize': true
});
if (!process.env.environment) {
    winston.warn('No environment var was found, setting the default environment to dev');
    process.env.environment = 'dev';
}
const config = require('../config/main.json');
let wsWorker = require('./ws/worker');
let vaultWorker = require('./vault/index');
if (process.env.vault_adress && process.env.vault_key) {
    let vaultService = new vaultWorker(process.env.vault_adress, process.env.vault_key);
    vaultService.loadConfig(configTemplate).then(() => {
        continueInit();
    });
} else {
    winston.warn('Not using Vault!');
    continueInit();
}
function continueInit() {
    require('dotenv').config({path: '../.env'});
    for (let key in configTemplate) {
        if (configTemplate.hasOwnProperty(key)) {
            if (!process.env[key]) {
                if (configTemplate[key].required) {
                    throw new Error(`The required config key ${key} is missing!`);
                } else {
                    winston.warn(`The optional config key ${key} is missing!`)
                }
            }
        }
    }
    let Shard = require('./shard');

    let wsService = new wsWorker();
    let client;

    wsService.on('ws_ready', (data) => {
        if (client) {
            try {
                client.shutdown();
            } catch (e) {
                console.error(e);
            }
            console.log(`Restarting Client for Resharding!`);
        }
        setTimeout(() => {
            client = new Shard(data.sid, data.shards, wsService);
        }, 500);

    });
    wsService.on('shutdown_client', () => {
        if (client) {
            try {
                client.shutdown();
            } catch (e) {
                console.error(e);
            }
            process.exit(1);
        }
    });
    winston.info(`Client Started!`);
    process.on('SIGINT', () => {
        winston.error('Received SIGINT');
        if (client) {
            try {
                client.shutdown();
            } catch (e) {
                console.error(e);
            }

        }
        process.exit(0);
    });
    winston.cli();
}
process.on('unhandledRejection', (reason, promise) => {
    if (typeof reason === 'undefined') return;
    winston.error(`Unhandled rejection: ${reason} - ${util.inspect(promise)}`);
});
// Now look at this net
function net() { // that I just found!
    // When I say go,
    // be ready to throw!

    // GO!
    throw net;
} // Urgh, let's try somthing else

