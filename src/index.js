/**Require the dependencies*/
//uwu
require('dotenv').config({path: '../.env'});
const winston = require('winston');
const config = require('../config/main.json');
let wsWorker = require('./ws/worker');
require('longjohn');
const util = require('util');
let Shard = require('./shard');
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    'timestamp': true,
    'colorize': true
});
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
winston.info(`Worker started ${process.env.id}/${process.env.count}`);
process.on('unhandledRejection', (reason, promise) => {
    if (typeof reason === 'undefined') return;
    winston.error(`Unhandled rejection: ${reason} - ${util.inspect(promise)}`);
});
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

// Now look at this net
function net() { // that I just found!
    // When I say go,
    // be ready to throw!

    // GO!
    throw net;
} // Urgh, let's try somthing else

