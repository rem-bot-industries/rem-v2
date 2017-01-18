/**
 * Created by Julian/Wolke on 13.11.2016.
 */
let mongoose = require('mongoose');
let permissionSchema = mongoose.Schema({
    id: String,
    permissions: []
});
let permModel = mongoose.model('Permissions', permissionSchema);
module.exports = permModel;