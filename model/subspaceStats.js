
/**
 * Create with servicePlatform
 * Author: Aurelia
 * Date: 2025/5/13
 * Desc
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubspaceStatsSchema = new Schema({
    sid: { type: String, required: true, unique: true },
    subspaceStats: {
        keys: { type: Map, of: Number },
        timestamp: { type: Number }
    },
    userStats: [{
        userId: String,
        eventBreakdown: { type: Map, of: Number }
    }],
    lastProcessedTimestamp: { type: Number }
});

module.exports = mongoose.model('SubspaceStats', SubspaceStatsSchema); 