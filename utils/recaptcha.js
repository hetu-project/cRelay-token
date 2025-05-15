/**
 * Create with faucet
 * Author: Aurelia
 * Date: 2025/2/15
 * Desc
 */
const config = require('../config');
const request = require('request');

// const checkRecaptcha = (req) => {
//     const secretKey = config.reCaptcha.secretKey;
//     if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
//         return 'Please select captcha.';
//     }
//     const verificationUrl = 'https://www.recaptcha.net/recaptcha/api/siteverify?secret=' + secretKey + '&response=' + req.body['g-recaptcha-response'] + '&remoteip=' + req.connection.remoteAddress;
//     request(verificationUrl, function (error, response, body) {
//         body = JSON.parse(body);
//         if (body.success !== undefined && !body.success) {
//             return 'Failed captcha verification';
//         }
//         return null;
//     });
// };

// module.exports = {checkRecaptcha};
module.exports = {};
