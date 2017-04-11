/**
 * Created by macdja38 on 2017-03-15.
 */
"use strict";

let https = require("https");
let url = require("url");
let stream = require("stream");
let Readable = stream.Readable;

let streamResume = {};
Object.assign(streamResume, https);
// let file = require("fs").createWriteStream('file.webm');

// let longjohn = require("longjohn");

class OutputStream extends Readable {
    constructor(options, httpOptions) {
        super(options);
        this._httpOptions = httpOptions;
        this._maxRetries = options.maxRetries;
        this._retries = 0;
        this._initialOffset = httpOptions.headers.Range ? parseRange(httpOptions.headers.Range).from : 0;

        this._endListener = this._endListener.bind(this);
        this._dataListener = this._dataListener.bind(this);
        this._errorListener = this._errorListener.bind(this);

        this._bytesSoFar = 0;

        this._resDead = false;
    }

    insertRes(res, contentLength) {
        this._contentLength = contentLength;
        this.res = res;
        this._addListeners();
    }

    _removeListeners() {
        try {
            this.res.removeListener("data", this._dataListener);
            this.res.removeListener("end", this._endListener);
            this.res.removeListener("error", this._errorListener);
            if (this._currentRequest) {
                this._currentRequest.removeListener("error", this._errorListener);
            }
        } catch (e) {

        }
    }

    _addListeners() {
        this.res.on("data", this._dataListener);
        this.res.on("end", this._endListener);
        this.res.on("error", this._errorListener);
    }

    _errorListener(error) {
        console.error("Caught", error);
        try {
            this._removeListeners();
        } catch (e) {
            // console.error(e);
            this.emit('error', e);
        }
        let resolveRes;
        this._resDead = new Promise((resolve, reject) => {
            resolveRes = resolve;
        });
        this._httpOptions.headers.Range = `bytes=${this._bytesSoFar + this._initialOffset}-`;
        // console.log("re-requesting", this._httpOptions.headers.Range);
        this._currentRequest = https.get(this._httpOptions,
            (res) => {
                this.res = res;
                this._addListeners();
                this._resDead = false;
                // console.log("New Res");
                resolveRes(res);
            }
        );
        this._currentRequest.on("error", this._errorListener);
    }

    _endListener() {
        // console.log("End fired");
        this.push(null);
        this._removeListeners();
    }

    _dataListener(data) {
        if (this._resDead) return;
        this._bytesSoFar += data.length;
        // console.log(this._bytesSoFar);
        if (!this.push(data)) {
            // console.log("Paused data input");
            this.res.pause();
        }
    }

    _read(size) {
        // console.log(size);
        if (this._resDead) {
            this._resDead.then(() => {
                // this.res.read(size);
            }).catch(() => {
            });
        } else {
            this.res.read(size);
        }
    }
}

streamResume.request = function (options, callback) {
    let requestOptions = {};
    if (typeof options === "string") {
        Object.assign(requestOptions, url.parse(options));
    } else {
        Object.assign(requestOptions, options);
    }
    if (!requestOptions.hasOwnProperty("headers")) {
        requestOptions.headers = {};
    }
    if (!requestOptions.hasOwnProperty("maxRequests")) {
        requestOptions.maxRetries = 20;
    }
    requestOptions.method = "GET";
    let outputStream = new OutputStream({highWaterMark: 4096}, requestOptions);
    // console.log(requestOptions);
    let newCallback = (res) => {
        // console.log(`HEADERS: ${res.headers}`);
        outputStream.insertRes(res, res.headers["content-length"]);
        callback(null, outputStream);
    };
    https.get(requestOptions, (res) => {
        // console.log(res.statusCode);
        // console.log(res.headers);
        // console.log(res);
        let contentLength = parseInt(res.headers['content-length']);
        // console.log(requestOptions);
        requestOptions.headers = {"content-length": `bytes 0-${contentLength - 1}/${contentLength}`};
        // console.log(requestOptions);
        return https.get(requestOptions, newCallback).once("error", outputStream._errorListener);
    }).once("error", outputStream._errorListener);

};

function parseRange(text) {
    let from = "";
    let to = "";
    let mode = 0;
    for (let char of text) {
        if (char === "=") {
            mode = 1;
        } else if (char === "-") {
            mode = 2
        } else if (mode === 1) {
            from += char;
        } else if (mode === 2) {
            to += char
        }
    }
    return {from: parseInt(from), to: parseInt(to)}
}

module.exports = streamResume;

/*
 streamResume.request("url here",
 (res) => {
 setInterval(() => {
 console.log(res.read(1000))
 }, 100);
 console.log(res)
 }
 );
 */