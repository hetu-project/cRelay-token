const axios = require('axios');
const config = require('../../config');

class SubspaceApi {
    constructor() {
        this.baseUrl = config.subspace.apiUrl;
        this.userApiUrl = config.subspace.userApiUrl;
    }

    async getSubspaceStats(sid) {
        try {
            const response = await axios.get(`${this.baseUrl}/${sid}`);
            if (response.status === 200 && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching subspace stats:', error);
            return null;
        }
    }

    async getUserStats(sid) {
        try {
            const response = await axios.get(`${this.userApiUrl}?sid=${sid}`);
            if (response.status === 200 && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return null;
        }
    }
}

module.exports = new SubspaceApi(); 