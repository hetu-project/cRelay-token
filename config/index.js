/**
 * Create with servicePlatform
 * Author: Aurelia
 * Date: 2025/2/15
 * Desc
 */

require('dotenv').config();

module.exports = {
    port: process.env.PORT,
    timeout: 600000,
    nodeHTTP: process.env.BLOCKCHAIN_NODE_HTTP,
    basicAmount: {
        unit: process.env.UNITAMOUNT,
        tat: process.env.TATAMOUNT,
    },
    mq: {
        host: process.env.MQ_HOST || 'http://localhost:8080',
        secretKey: process.env.MQ_SECRET_KEY || 'your_secret_key'
    },
    twitter: {
        url: 'https://api.twitter.com',
        authorization: process.env.TWITTER_AUTH,
        officialTweetId: process.env.OFFICIAL_TWEET_ID
    },
    reCaptcha: {
        secretKey: process.env.RECAPTCHA_SECRETKEY
    },
    mongodb: {
        replicaSet: process.env.MONGO_REPLICASET_NAME || false,
        host: process.env.MONGO_HOST,
        database: process.env.MONGO_NAME,
        username: process.env.MONGO_USER,
        password: process.env.MONGO_PWD,
        DB_URL: process.env.MONGO_URL || ''
    },
    nostr: {
        relayUrl: process.env.NOSTR_RELAY_WS || 'ws://localhost:10547',
        mintEventKind: parseInt(process.env.MINT_EVENT_KIND) || 30304
    },
    subspace: {
        apiUrl: process.env.SUBSPACE_API_URL || 'http://localhost:8080/subspaces',
        userApiUrl: process.env.SUBSPACE_USER_API_URL || 'http://localhost:8080/subspace/user'
    },
    token: {
        decimals: parseInt(process.env.TOKEN_DECIMALS) || 18
    }
};
