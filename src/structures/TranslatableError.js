/**
 * Created by Julian on 21.03.2017.
 */
class TranslatableError {
    constructor(json) {
        if (!json.t) {
            throw new Error('No translation id set!');
        }
        for (let property in json) {
            if (json.hasOwnProperty(property)) {
                this[property] = json[property];
            }
        }
    }
}
module.exports = TranslatableError;