/**
 * Created by Julian/Wolke on 29.04.2017.
 */
const EventEmitter = require('events').EventEmitter;
class ProcToWs extends EventEmitter {
    forwardMessage(msg) {
        process.send(JSON.stringify({type: "msg", msg}));
    }

    updateStats(stats) {
        this.forwardMessage({action: 'updateStats', d: stats});
    }

    executeAction(action, actionID) {
        this.forwardMessage({action: 'executeAction', d: {action, actionID}});
    }

    respondAction(event, data) {
        this.forwardMessage({action: 'respondAction', d: {event, data}});
    }

    updateState(state) {
        this.forwardMessage({action: 'updateState', d: {state}});
    }

    send() {

    }
}
module.exports = ProcToWs;