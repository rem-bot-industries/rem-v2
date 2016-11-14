/**
 * Created by julia on 13.11.2016.
 */
var mongoose = require('mongoose');
var permissionSchema = mongoose.Schema({
    id: String,
    permissions: []
});
var permModel = mongoose.model('Permissions', permissionSchema);
module.exports = permModel;