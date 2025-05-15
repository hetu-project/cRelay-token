const axios = require('axios');
const config = require('../../config');

class TokenDistributor {
    constructor() {
        this.mqHost = config.mq.host;
        this.mqSecretKey = config.mq.secretKey;
    }

    async distribute(distributionData) {
        try {
            const response = await axios.post(
                `${this.mqHost}/api/tokenDistribution`,
                { message: JSON.stringify(distributionData) },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.mqSecretKey}`
                    }
                }
            );

            if (response.status === 200) {
                console.log('Token distribution data sent successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error sending token distribution data:', error);
            return false;
        }
    }
}

module.exports = new TokenDistributor(); 