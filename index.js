const cluster = require('cluster');
const winston = require('winston');
const winstonCluster = require('winston-cluster');
const config = require('./config/main.json');
let StatTrack = require('./modules/statTrack');
require('longjohn');
require('winston-daily-rotate-file');
const util = require("util");
const numCPUs = require('os').cpus().length;
let Shard = require('./shard');
let responses = 0;
let users = 0;
let guilds = 0;
if (cluster.isMaster) {
    let tracker = new StatTrack(5 * 60 * 60);
    let resp = [];
    tracker.on('fetch', () => {
        broadcast({type: 'stats'});
        tracker.setStats(guilds, users);
    });
    let workers = [];
    process.on('SIGINT', () => {
        winston.error('Received SIGINT');
        process.exit(0);
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
    for (let i = 0; i < config.shards; i++) {
        let worker = cluster.fork({id: i, count: config.shards});
        let workerobject = {worker: worker, shard_id: i, pid: worker.process.pid};
        workers.push(workerobject)
    }
    cluster.on('message', handleMessage);
    // winstonCluster.bindListeners();
    winston.info('Spawned Shards!');
    cluster.on('exit', (worker, code, signal) => {
        winston.error(`worker ${worker.process.pid} died`);
        restartWorker(worker.process.pid);
    });
    function restartWorker(pid) {
        for (let i = 0; i < workers.length; i++) {
            if (pid === workers[i].pid) {
                let index = workers.indexOf(workers[i]);
                if (index > -1) {
                    spawnWorker({id: workers[i].shard_id, count: config.shards});
                    workers.splice(index, 1);
                }
            }
        }
    }

    function spawnWorker(env) {
        let worker = cluster.fork(env);
        let workerobject = {worker: worker, shard_id: env.id, pid: worker.process.pid};
        workers.push(workerobject);
        // worker.on('online', () => {
        // });
        // winstonCluster.bindListeners();
    }

    function handleMessage(worker, message, handle) {
        if (message.type === 'stats') {
            resp.push(message);
            responses += 1;
            if (responses === config.shards) {
                users = 0;
                guilds = 0;
                responses = 0;
                for (let i = 0; i < resp.length; i++) {
                    users += resp[i].d.users;
                    guilds += resp[i].d.guilds;
                }
                resp = [];
                winston.info(`Final Users: ${users} Guilds:${guilds}`);
            }
        }
    }

    function broadcast(msg) {
        for (let i = 0; i < workers.length; i++) {
            workers[i].worker.send(msg);
        }
    }
} else {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
        'timestamp': true,
        'colorize': true
    });
    // winstonCluster.bindTransport();
    let client = new Shard(process.env.id, process.env.count);
    winston.info(`Worker started ${process.env.id}/${process.env.count}`);

}
process.on('unhandledRejection', (reason, promise) => {
    if (typeof reason === 'undefined') return;
    winston.error(`Unhandled rejection: ${reason} - ${util.inspect(promise)}`)
});
winston.cli();