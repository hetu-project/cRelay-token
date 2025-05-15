/**
 * Create with faucet
 * Author: Aurelia
 * Date: 2025/2/15
 * Desc
 */

// const express = require('express');
// const app = express();

// const fs = require('fs');
// const path = require('path');

// const privateKey = fs.readFileSync(path.join(__dirname, './httpsCert/server.key'), 'utf8');
// const certificate = fs.readFileSync(path.join(__dirname, './httpsCert/server.crt'), 'utf8');
// const credentials = {key: privateKey, cert: certificate};

// const {port, timeout} = require('./config');

// const https = require('https').Server(credentials, app);
// https.timeout = timeout;

// const bodyParser = require('body-parser');
// const compression = require('compression');
// const session = require('express-session');

// app.use(session({
//     secret: 'trustslink666',
//     name: 'captcha',
//     cookie: {
//         maxAge: 100000    /*过期时间*/
//     },
// }));

// // 压缩
// app.use(compression());

// app.use(express.static(path.join(__dirname, '/views')));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));

// const routes = require('./router/index');
// routes(app);

// require('./db/connect');

// //创建https服务器
// https.listen(port, function () {
//     console.info(`Please open Internet explorer to access ：https://localhost:${port}/`);
// });

// process.on('unhandledRejection', function (err) {
//     console.error('catch exception:', err.stack);
// });

// process.on('uncaughtException', function (err) {
//     console.error('catch exception:', err.stack);
// });

const express = require('express');
const config = require('./config');
const nostrRelay = require('./services/nostr/relay');
const eventProcessor = require('./services/nostr/eventProcessor');

const app = express();
app.use(express.json());

// Initialize Nostr relay connection
nostrRelay.connect();

// Handle incoming Nostr events
nostrRelay.on('event', async (event) => {
    if (event.kind === config.nostr.mintEventKind) {
        await eventProcessor.processMintEvent(event);
        nostrRelay.updateLastProcessedTimestamp(event.created_at);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', nostrConnected: nostrRelay.isConnected });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});