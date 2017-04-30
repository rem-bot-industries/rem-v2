/**
 * Created by Julian on 30.04.2017.
 */
const Stream = require('stream');
const https = require('https');
const http = require('http');
const URL = require('url');
class WolkeStream extends Stream.Readable {
    constructor(url, options) {
        super();
        this.output = new Stream.PassThrough({highWaterMark: 32768});
        this.total = 0;
        this.done = 0;
        this.url = url;
        this.request(url, 0);
        return this.output;
    }

    request(url, length) {
        const options = typeof url === 'string' ? URL.parse(url) : url;
        if (!options.headers) options.headers = {};
        if (length > 0) {
            options.headers.Range = `bytes=${length}-`;
        }
        try {
            if (options.protocol === 'https:') {
                let req = https.get(options, (res) => {
                    this.processRes(req, res);
                });
            } else {
                let req = http.get(options, (res) => {
                    this.processRes(req, res);
                });
            }
        } catch (e) {
            console.error(e);
            return this.request(url, length);
        }
    }

    processRes(req, res) {
        if (this.done === 0) this.total = Number(res.headers['content-length']);
        req.on('error', (err) => {
            if (!err) return;
            console.error(err);
            if (err.message === 'read ECONNRESET') {
                this.output.pause();
                res.unpipe();
                res.removeAllListeners();
                req.removeAllListeners();
                return this.request(this.url, this.done);
            }
        });
        res.on('data', (chunk) => {
            this.done += Buffer.byteLength(chunk);
            // console.log(Buffer.byteLength(chunk));
        });
        res.on('aborted', (err) => {
            console.error(err);
            this.output.pause();
            res.unpipe();
            res.removeAllListeners();
            req.removeAllListeners();
            return this.request(this.url, this.done);
        });
        res.on('error', (err) => {
            if (!err) return;
            console.error(err);
            if (err.message === 'read ECONNRESET') {
                this.output.pause();
                res.unpipe();
                res.removeAllListeners();
                req.removeAllListeners();
                return this.request(this.url, this.done);
            }
        });
        res.on('end', () => {
            if (this.done < this.total) {
                res.unpipe();
                res.removeAllListeners();
                req.removeAllListeners();
                return this.request(this.url, this.done);
            } else {
                this.output.end();
            }
        });
        res.pipe(this.output, {end: false});
    }
}
module.exports = WolkeStream;