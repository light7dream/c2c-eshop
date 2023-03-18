var mysql = require('mysql');
var moment = require('moment');
let config = require('../package.json').config;

var sql = {};

//定义pool池
var pool = mysql.createPool({
    host: config.mysql_host,
    user: config.mysql_user,
    password: config.mysql_pwd,
    database: config.mysql_db_name,
    port: config.mysql_port,
    charset: 'utf8',
    timezone: "08:00",
    multipleStatements: true
});

sql.pools = {
    "Test": mysql.createPool({
        host: config.mysql_host,
        user: config.mysql_user,
        password: config.mysql_pwd,
        database: 'test_db',
        port: config.mysql_port,
        charset: 'utf8',
        timezone: "08:00",
        multipleStatements: true
    }),
    "Default": mysql.createPool({
        host: config.mysql_host,
        user: config.mysql_user,
        password: config.mysql_pwd,
        database: 'test_db',
        port: config.mysql_port,
        charset: 'utf8',
        timezone: "08:00",
        multipleStatements: true
    }),
}

sql.query = function (sql, params) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.error(moment().format() + " sql.query:" + err + "----sql:" + sql);
                reject(err);
            }
            // console.error(sql, params)
            connection.query(sql, params, function (err, result) {
                if (err) {
                    console.error(moment().format() + "\n #### sql.query:" + err + "\n----sql:" + sql + "\n----param:" + params);
                    reject(err);
                }

                //console.log(result);
                resolve(result);
            });
            //回收pool
            connection.release();
        });
    });
};

sql.query_multi = function (pool, sql, params) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.error(moment().format() + " sql.query:" + err + "----sql:" + sql);
                reject(err);
            }

            connection.query(sql, params, function (err, result) {
                if (err) {
                    console.error(moment().format() + "\n #### sql.query:" + err + "\n----sql:" + sql + "\n----param:" + params);
                    reject(err);
                }

                //console.log(result);
                resolve(result);
            });
            //回收pool
            connection.release();
        });
    });
};

sql.format = function (sql, params) {
    return new Promise(function (resolve, reject) {
        resolve(mysql.format(sql, params));
    });
};

sql.escape = function (params) {
    return new Promise(function (resolve, reject) {
        var arr = [];
        for (var p of params) {
            arr.push(mysql.escape(p));
        }
        resolve(arr);
    });
};

module.exports = sql;