const WebSocket = require('ws');
const { EventEmitter } = require('events');
const config = require('../../config');

class NostrRelay extends EventEmitter {
    constructor() {
        super();
        this.ws = null;
        this.lastProcessedTimestamp = Math.floor(Date.now() / 1000);
        this.isConnected = false;
    }

    connect() {
        this.ws = new WebSocket(config.nostr.relayUrl);

        this.ws.on('open', () => {
            console.log('Connected to Nostr relay');
            this.isConnected = true;
            this.subscribe();
        });

        this.ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                if (message[0] === 'EVENT') {
                    this.emit('event', message[1]);
                }
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        this.ws.on('close', () => {
            console.log('Disconnected from Nostr relay');
            this.isConnected = false;
            setTimeout(() => this.connect(), 5000);
        });

        this.ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.isConnected = false;
        });
    }

    subscribe() {
        const filter = {
            kinds: [config.nostr.mintEventKind],
            since: this.lastProcessedTimestamp
        };

        const subscription = ['REQ', 'mint-events', filter];
        this.ws.send(JSON.stringify(subscription));
    }

    updateLastProcessedTimestamp(timestamp) {
        this.lastProcessedTimestamp = timestamp;
    }
}

module.exports = new NostrRelay(); 