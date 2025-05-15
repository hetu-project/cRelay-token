/**
 * Create with servicePlatform
 * Author: Aurelia
 * Date: 2025/2/15
 * Desc
 */

const config = require('../config').mongodb;
const mongoose = require('mongoose');

const DB_URL = config.DB_URL || `mongodb://${config.username}:${config.password}@${config.host}/${config.database}?authSource=admin`;

/**
 * 连接
 */
mongoose.connect(DB_URL, {keepAlive: true});

/**
 * 连接成功
 */
mongoose.connection.on('connected', function () {
    console.info('Mongoose connection open to ' + DB_URL);
});

/**
 * 连接异常
 */
mongoose.connection.on('error', function (err) {
    console.error('Mongoose connection error: ' + err);
});

/**
 * 连接断开
 */
mongoose.connection.on('disconnected', function () {
    console.info('Mongoose connection disconnected');
});

module.exports = mongoose;
