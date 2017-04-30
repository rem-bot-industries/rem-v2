/**
 * Created by Julian/Wolke on 29.04.2017.
 */
const EventEmitter = require('events').EventEmitter;
class ProcToWs extends EventEmitter {
    constructor() {
        super();
        process.on('message', (msg) => {
            try {
                msg = JSON.parse(msg);
                // console.log(`Process message: ${JSON.stringify(msg)}`);
                this.checkMessage(msg);
            } catch (e) {
                console.error(e);
            }
        })
    }

    checkMessage(msg) {
        // console.log('CHECK MESSAGE');
        switch (msg.d.action) {
            case 'shard_info': {
                if (msg.d.request) {
                    this.emit('action', msg.d);
                } else {
                    this.emit(`action_resolved_${msg.d.actionId}`, msg.d);
                }
                return;
            }
            default: {
                if (!msg.d.actionId) {
                    this.emit(msg.d.action, msg.d.data);
                } else {
                    console.log(`${msg.d.action}_${msg.d.actionId}`);
                    this.emit(`action_resolved_${msg.d.actionId}`, msg.d);
                }
                return;
            }
        }
    }

    forwardMessage(d) {
        process.send(JSON.stringify({type: "msg", d}));
    }

    updateStats(stats) {
        this.forwardMessage({action: 'updateStats', d: stats});
    }

    executeAction(action, actionId) {
        this.forwardMessage({action: 'executeAction', d: {action, actionId}});
    }

    respondAction(event, data) {
        this.forwardMessage({action: 'respondAction', d: {event, data}});
    }

    updateState(state) {
        this.forwardMessage({action: 'updateState', d: {state}});
    }

    send(msg) {
        this.forwardMessage(JSON.stringify({action: 'message', d: msg}))
    }
}
module.exports = ProcToWs;