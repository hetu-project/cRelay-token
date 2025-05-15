/**
 * Create with servicePlatform
 * Author: Aurelia
 * Date: 2025/5/13
 * Desc
 */

const SubspaceStats = require('../model/subspaceStats');

class SubspaceStatsService {
    // 保存子空间统计数据
    async saveStats(sid, subspaceStats, userStats, timestamp) {
        try {
            const stats = {
                sid,
                subspaceStats: {
                    keys: subspaceStats.keys,
                    timestamp
                },
                userStats: userStats.map(user => ({
                    userId: user.id,
                    eventBreakdown: user.event_breakdown
                })),
                lastProcessedTimestamp: timestamp
            };

            await SubspaceStats.findOneAndUpdate(
                { sid },
                stats,
                { upsert: true, new: true }
            );
            return true;
        } catch (error) {
            console.error('保存子空间统计数据失败:', error);
            return false;
        }
    }

    // 获取上次处理的统计数据
    async getLastStats(sid) {
        try {
            const stats = await SubspaceStats.findOne({ sid });
            return stats;
        } catch (error) {
            console.error('获取上次统计数据失败:', error);
            return null;
        }
    }

    // 计算新的统计数据（当前值减去上次值）
    calculateNewStats(currentStats, lastStats) {
        if (!lastStats) {
            return currentStats;
        }

        const newStats = {
            subspaceStats: {
                keys: {},
                timestamp: currentStats.subspaceStats.timestamp
            },
            userStats: []
        };

        // 计算子空间统计的新值
        const currentKeys = currentStats.subspaceStats.keys;
        const lastKeys = lastStats.subspaceStats.keys;

        // 处理所有当前存在的键，包括新加入的子空间
        for (const [key, value] of Object.entries(currentKeys)) {
            const lastValue = lastKeys[key] || 0;
            newStats.subspaceStats.keys[key] = value - lastValue;
        }

        // 计算用户统计的新值
        currentStats.userStats.forEach(currentUser => {
            const lastUser = lastStats.userStats.find(u => u.userId === currentUser.userId);
            const newUserStats = {
                userId: currentUser.userId,
                eventBreakdown: {}
            };

            // 处理所有当前用户的事件类型，包括新的事件类型
            for (const [eventType, count] of Object.entries(currentUser.event_breakdown)) {
                const lastCount = lastUser ? (lastUser.event_breakdown[eventType] || 0) : 0;
                newUserStats.eventBreakdown[eventType] = count - lastCount;
            }

            newStats.userStats.push(newUserStats);
        });

        return newStats;
    }
}

module.exports = new SubspaceStatsService(); 