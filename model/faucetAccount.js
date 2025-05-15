/**
 * Create with faucet
 * Author: Aurelia
 * Date: 2025/2/15
 * Desc
 */

const mongoose = require('../db/connect');

const FaucetAccountSchema = new mongoose.Schema({
    account: {type: String, index: true},
    expiration: {type: Date, default: Date.now},
    tweetExpiration: {type: Date, default: Date.now},
    checkIn: Array,
});

module.exports = mongoose.model('faucetAccount', FaucetAccountSchema);
