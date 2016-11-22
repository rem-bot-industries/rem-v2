const cluster = require('cluster');
const winston = require('winston');
const winstonCluster = require('winston-cluster');
require('longjohn');
require('winston-daily-rotate-file');
var util = require("util");
const numCPUs = require('os').cpus().length;
if (cluster.isMaster) {
    process.on('SIGINT', () => {
        console.log('Received SIGINT');

    });
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
        'timestamp': true,
        'colorize': true
    });
    winston.add(winston.transports.DailyRotateFile, {
        'timestamp': true,
        'datePattern': '.yyyy-MM-dd',
        'filename': 'logs/rem.log'
    });
    for (var i = 0; i < 2; i++) {
        cluster.fork()
    }
    winstonCluster.bindListeners();
    winston.info('Spawned Shards!');
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
        'timestamp': true,
        'colorize': true
    });
    winstonCluster.bindTransport();
    winston.info("Worker started!");
}
process.on('unhandledRejection', (reason, promise) => {
    if (typeof reason === 'undefined') return;
    winston.error(`Unhandled rejection: ${reason} - ${util.inspect(promise)}`)
});
winston.cli();