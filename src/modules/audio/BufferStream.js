/**
 * Created by Julian on 14.03.2017.
 */
let EventEmitter = require('events');
const Readable = require('stream').Readable;
const winston = require('winston');
class UwUBuffer extends EventEmitter {
    constructor(sourceStream) {
        super();
        this.buf = [];
        this.allowReading = true;
        this.dataAdded = 0;
        this.sourceEnded = false;
        // this.interval = setInterval(() => {
        //     console.log(`Buffer Length: ${this.buf.length}`);
        // }, 1000);
        this.sourceStream = sourceStream;
        this.sourceStream.on('data', (data) => {
            // console.log(Buffer.byteLength(data));
            this.buf.push(data);
            this.dataAdded++;
        });
        this.sourceStream.on('error', (err) => {
            winston.error(err);
            this.sourceEnded = true;
            // clearInterval(this.interval);
            this.emit('error', err);
            this.emit('end');
        });
        this.sourceStream.on('end', () => {
            // console.log('sourcestream ended!');
            this.sourceEnded = true;
            // this.emit('end');
        });
    }

    readStart() {
        this.allowReading = true;
        // console.log('read start called!');
        if (this.dataAdded < 8 && this.buf.length < 8) {
            setTimeout(() => {
                this.readStart();
            }, 50);
            return;
        }
        // if (this.buf.length === 0 && this.dataAdded) {
        //     this.emit('end');
        //     return;
        // }
        if (this.buf.length !== 0) {
            while (this.buf.length !== 0) {
                if (this.allowReading) {
                    this.emit('data', this.buf.shift());
                } else {
                    break;
                }
            }
        }
        if (this.sourceEnded && this.buf.length === 0 && this.dataAdded > 16) {
            // console.log('source ended!');
            // clearInterval(this.interval);
            this.emit('end');
        }
    }

    readStop() {
        this.allowReading = false;
    }

    close() {
        this.buf = [];
        this.sourceStream.removeAllListeners();
        if (typeof this.sourceStream.destroy === "function") {
            this.sourceStream.destroy();
        } else {
            this.sourceStream.unpipe();
        }
        this.removeAllListeners();
        // clearInterval(this.interval);
    }
}
class BufferStream extends Readable {
    constructor(options, _source) {
        super(options);
        this._uwuBuffer = new UwUBuffer(_source);
        this._uwuBuffer.on('data', (chunk) => {
            // console.log('got data from buffer!');
            if (!this.push(chunk)) {
                // console.log('stopping buffer read!');
                this._uwuBuffer.readStop();
            }
        });
        this._uwuBuffer.on('end', () => {
            // console.log('Buffer ended!');
            this.push(null);
        });
    }

    rip() {
        this._uwuBuffer.close();
    }

    _read(size) {
        this._uwuBuffer.readStart();
    }
}
module.exports = BufferStream;