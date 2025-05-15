/**
 * Create with faucet
 * Author: Aurelia
 * Date: 2025/2/15
 * Desc
 */
const faucet = require('./faucet');

module.exports = (app) => {
    new faucet(app);
};
