const axios = require('axios');
const config = require('../../config');
const subspaceApi = require('../subspace/api');
const weightCalculator = require('../subspace/calculator');
const tokenDistributor = require('../token/distributor');
const subspaceStatsService = require('../../service/subspaceStats');

class EventProcessor {
    async processMintEvent(event) {
        try {
            // 提取token信息
            const tokenInfo = this.extractTokenInfo(event);
            if (!tokenInfo) {
                console.error('无效的token信息');
                return;
            }

            // 获取当前子空间统计
            const currentSubspaceStats = await subspaceApi.getSubspaceStats(tokenInfo.sid);
            if (!currentSubspaceStats) {
                console.error('获取子空间统计失败');
                return;
            }

            // 获取当前用户统计
            const currentUserStats = await subspaceApi.getUserStats(tokenInfo.sid);
            if (!currentUserStats) {
                console.error('获取用户统计失败');
                return;
            }

            // 获取上次处理的统计数据
            const lastStats = await subspaceStatsService.getLastStats(tokenInfo.sid);

            // 计算新的统计数据
            const newStats = subspaceStatsService.calculateNewStats(
                {
                    subspaceStats: currentSubspaceStats,
                    userStats: currentUserStats
                },
                lastStats
            );

            // 计算用户权重
            const userWeights = weightCalculator.calculateUserWeights(
                newStats.userStats,
                newStats.subspaceStats,
                tokenInfo.dropRatio
            );

            // 准备分发数据
            const distributionData = {
                account: tokenInfo.creator,
                tokenName: tokenInfo.tokenName,
                tokenSymbol: tokenInfo.tokenSymbol,
                tokenDecimals: tokenInfo.tokenDecimals,
                initialSupply: tokenInfo.initialSupply,
                userWeights
            };

            // 保存当前统计数据
            await subspaceStatsService.saveStats(
                tokenInfo.sid,
                currentSubspaceStats,
                currentUserStats,
                event.created_at
            );

            // 发送到消息队列
            await tokenDistributor.distribute(distributionData);

        } catch (error) {
            console.error('处理mint事件失败:', error);
        }
    }

    extractTokenInfo(event) {
        try {
            const tags = event.tags;
            const tokenInfo = {
                sid: this.findTagValue(tags, 'sid'),
                tokenName: this.findTagValue(tags, 'token_name'),
                tokenSymbol: this.findTagValue(tags, 'token_symbol'),
                tokenDecimals: parseInt(this.findTagValue(tags, 'token_decimals')),
                initialSupply: this.findTagValue(tags, 'initial_supply'),
                dropRatio: this.parseDropRatio(this.findTagValue(tags, 'drop_ratio')),
                creator: event.pubkey
            };

            // 验证必填字段
            if (!tokenInfo.sid || !tokenInfo.tokenName || !tokenInfo.tokenSymbol || 
                !tokenInfo.tokenDecimals || !tokenInfo.initialSupply || !tokenInfo.dropRatio ||
                !tokenInfo.creator) {
                return null;
            }

            return tokenInfo;
        } catch (error) {
            console.error('提取token信息失败:', error);
            return null;
        }
    }

    findTagValue(tags, key) {
        const tag = tags.find(t => t[0] === key);
        return tag ? tag[1] : null;
    }

    parseDropRatio(dropRatioStr) {
        const ratios = {};
        dropRatioStr.split(',').forEach(pair => {
            const [eventType, weight] = pair.split(':');
            ratios[eventType] = parseInt(weight);
        });
        return ratios;
    }
}

module.exports = new EventProcessor(); 