/**
 * Created by julia on 07.11.2016.
 */
var r = require('rethinkdb');
var connection = null;
var connect = () => {
    r.connect({db:'rem'}, (err, conn) => {
        setConnection(conn);
    });
};
var getConnection = () => {
    return connection;
};
var setConnection = (conn) => {
    connection = conn;
};
var getR = () => {
    return r;
};
var setR = (r) => {
    this.r = r;
};
module.exports = {connect:connect, getConnection:getConnection, setConnection:setConnection, getR:getR, setR:setR};