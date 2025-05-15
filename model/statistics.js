/**
 * Create with faucet
 * Author: Aurelia
 * Date: 2025/2/15
 * Desc
 */

const mongoose = require('../db/connect');

const StatisticSchema = new mongoose.Schema({
    TAT: Number,
    UNIT: Number,
    account: String,
    timestamp: {type: Date, default: Date.now},
    date: Number
});

module.exports = mongoose.model('statistic', StatisticSchema);
