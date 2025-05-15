class WeightCalculator {
    calculateUserWeights(userStats, subspaceStats, dropRatio) {
        const userWeights = {};

        // Calculate total weight for each event type in the subspace
        const subspaceEventWeights = this.calculateSubspaceEventWeights(subspaceStats, dropRatio);

        // Calculate individual user weights
        for (const user of userStats) {
            const userWeight = this.calculateUserWeight(user, subspaceEventWeights, dropRatio);
            if (userWeight > 0) {
                userWeights[user.id] = userWeight;
            }
        }

        return userWeights;
    }

    calculateSubspaceEventWeights(subspaceStats, dropRatio) {
        const eventWeights = {};
        const keys = subspaceStats.keys || {};

        // Calculate weight for each event type
        for (const [eventType, weight] of Object.entries(dropRatio)) {
            const eventCount = keys[eventType] || 0;
            eventWeights[eventType] = eventCount * weight;
        }

        return eventWeights;
    }

    calculateUserWeight(user, subspaceEventWeights, dropRatio) {
        let totalWeight = 0;
        const eventBreakdown = user.event_breakdown || {};

        // Calculate user's contribution to each event type
        for (const [eventType, weight] of Object.entries(dropRatio)) {
            const userEventCount = eventBreakdown[eventType] || 0;
            const subspaceEventWeight = subspaceEventWeights[eventType] || 0;

            if (subspaceEventWeight > 0) {
                // Calculate proportional weight based on user's contribution
                const proportionalWeight = (userEventCount / subspaceEventWeight) * weight;
                totalWeight += proportionalWeight;
            }
        }

        return totalWeight;
    }
}

module.exports = new WeightCalculator(); 