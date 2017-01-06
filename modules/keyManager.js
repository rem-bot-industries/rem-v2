/**
 * Created by julia on 06.01.2017.
 */
class KeyManager {
    constructor(keys) {
        this.keys = keys;
        this.currentKey = this.keys[0];
        this.keyIndex = 0;
        this.maxKeyIndex = this.keys.length - 1;
    }

    getKey() {
        return this.currentKey;
    }

    nextKey() {
        if (this.keyIndex < this.maxKeyIndex) {
            this.keyIndex += 1;
            this.currentKey = this.keys[this.keyIndex + 1];
        } else {
            this.currentKey = this.keys[0];
            this.keyIndex = 0;
        }
    }

    resetKeyIndex() {
        this.currentKey = this.keys[0];
        this.keyIndex = 0;
    }
}
module.exports = KeyManager;