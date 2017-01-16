/**Require the dependencies*/
const cluster = require('cluster');
const winston = require('winston');
const winstonCluster = require('winston-cluster');
const config = require('./config/main.json');
let hub = require('clusterhub');
let StatTrack = require('./modules/statTrack');
let _ = require('lodash');
require('longjohn');
require('winston-daily-rotate-file');
const util = require("util");
let Shard = require('./shard');
let async = require('async');
/**
 * Check if the Cluster process is master
 */
if (cluster.isMaster) {
    let tracker = new StatTrack(60);
    let resp = [];
    let workers = [];
    let shards = {};
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
    cluster.on('exit', (worker, code, signal) => {
        winston.error(`worker ${worker.process.pid} died`);
        restartWorker(worker.process.pid);
    });
    hub.on('_guild_update', (sid, guilds) => {
        shards[sid].guilds = guilds;
    });
    hub.on('_user_update', (sid, users) => {
        shards[sid].users = users;
    });
    hub.on('shard_restart_request', (data) => {
        let Shard = findWorkerByShardId(data.sid, workers);
        if (Shard) {
            Shard.worker.kill('SIGINT');
        }
    });
    /**
     * If a shard requests data
     */
    hub.on('request_data', (event) => {
        /**
         * send a request_data_master event to all shards
         */
        hub.emitRemote('request_data_master', event);
        let shardData = {};
        let responses = 0;
        /**
         * set up a timeout
         */
        let time = setTimeout(() => {
            returnData({err: 'Timeout!'})
        }, 2000);
        /**
         * Called once a shard received the request and submitted data
         */
        hub.on(`resolve_data_master_${event.id}`, (data) => {
            shardData[data.sid] = data;
            responses++;
            if (responses === config.shards) {
                clearTimeout(time);
                hub.removeListener(`resolve_data_master_${event.id}`);
                returnData(shardData);
            }
        });
        /**
         * Resolves the data request
         * @param data
         */
        function returnData(data) {
            hub.emitRemote(`resolved_data_${event.id}`, data);
        }
    });

    tracker.on('error', (err) => {

    });
    tracker.on('fetch', () => {
        let guilds = 0;
        let users = 0;
        _.forIn(shards, (value, key) => {
            guilds += value.guilds;
            users += value.users;

        });
        console.log(`Total Guilds: ${guilds}, Total Users: ${users}`);
        tracker.update(guilds, users);
    });
    process.on('SIGINT', () => {
        winston.error('Received SIGINT');
        for (let i = 0; i < workers.length; i++) {
            workers[i].worker.kill('SIGINT');
        }
        process.exit(0);
    });
    for (let i = 0; i < config.shards; i++) {
        shards[i] = {guilds: 0, users: 0};
        let worker = cluster.fork({id: i, count: config.shards});
        let workerobject = {worker: worker, shard_id: i, pid: worker.process.pid};
        workers.push(workerobject);
    }
    winston.info('Spawned Shards!');
    winstonCluster.bindListeners();
    /**
     * Restarts a Worker if it died
     * @param pid Process ID
     */
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

    /**
     * Spawns a worker and saves it in a list
     * @param env
     */
    function spawnWorker(env) {
        shards[env.id] = {guilds: 0, users: 0};
        let worker = cluster.fork(env);
        let workerobject = {worker: worker, shard_id: env.id, pid: worker.process.pid};
        workers.push(workerobject);
        winstonCluster.bindListeners();
    }
} else {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
        'timestamp': true,
        'colorize': true
    });
    winstonCluster.bindTransport();
    let client = new Shard(process.env.id, process.env.count, hub);
    winston.info(`Worker started ${process.env.id}/${process.env.count}`);

}
function findWorkerByShardId(id, workers) {
    for (let i = 0; i < workers.length; i++) {
        if (workers[i].shard_id === id) {
            return workers[i];
        }
    }
    return null;
}
process.on('unhandledRejection', (reason, promise) => {
    if (typeof reason === 'undefined') return;
    winston.error(`Unhandled rejection: ${reason} - ${util.inspect(promise)}`)
});
winston.cli();

// Now look at this net
function net() { // that I just found!
    // When I say go,
    // be ready to throw!
    
    // GO!
    throw net;
} // Urgh, let's try somthing else
