/**
 * Created by julia on 10.02.2017.
 */
let axios = require('axios');
let winston = require('winston');
let dotenv = require('dotenv');
let fs = require("fs");
class VaultClient {
    constructor(ip, key) {
        if (!ip) throw new Error('The Client needs an adress to connect to!');
        if (!key) throw new Error('The Client needs a key to authorize with the vault server!');
        this.ip = ip;
        this.key = key;
    }

    async read(path) {
        let req = await axios.get(`${this.ip}/v1/secret/${path}`, {headers: {"X-Vault-Token": this.key}});
        if (!req.data.request_id) {
            throw new Error('The document could not be found!');
        }
        return req.data;
    }

    async write(path, name, value) {
        let data = {};
        data[name] = value;
        let req = await axios.post(`${this.ip}/v1/secret/${path}`, data, {
            headers: {
                "X-Vault-Token": this.key,
                "Content-Type": "application/json"
            }
        });
        if (req.status !== 204) {
            throw new Error('The document could not be created!');
        }
        return Promise.resolve;
    }

    async loadConfig(configTemplate) {
        for (let key in configTemplate) {
            if (configTemplate.hasOwnProperty(key)) {
                try {
                    let keyPair = await this.read(`rem/${process.env.environment}/${key}`);
                    for (let prop in keyPair.data) {
                        if (keyPair.data.hasOwnProperty(prop)) {
                            process.env[prop] = keyPair.data[prop];
                            winston.info(`Loaded ${prop} as an env variable!`);
                        }
                    }
                } catch (e) {
                    // this.loadEnv(fs.readFileSync('../.env', {encoding: 'utf8'}));
                }

            }
        }
        return Promise.resolve;
    }

    async loadEnv(src) {
        let obj = dotenv.parse(src);
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                try {
                    await this.write(`rem/${process.env.environment}/${key}`, key, obj[key]);
                } catch (e) {
                    console.error(e);
                    // console.error(e.response.data);
                }
            }
        }
    }

}
module.exports = VaultClient;