/**
 * Created by Julian/Wolke on 18.02.2017.
 */
class RedisCache {
    constructor(redisClient) {
        this.client = redisClient;
    }

    async get(id) {
        // console.log(id);
        let val = await this.client.getAsync(id);
        //uwu
        return JSON.parse(val);
    }

    async set(id, value) {
        let val = JSON.stringify(value);
        // console.log(value);
        // console.log(id);
        await this.client.setAsync(id, val);
        return this.client.expireAsync(id, 60 * 60);
    }

    async remove(id) {
        return this.client.delAsync(id);
    }

    async exists(id) {
        return this.client.existsAsync(id);
    }
}
module.exports = RedisCache;