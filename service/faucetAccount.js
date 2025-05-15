/**
 * Create with faucet
 * Author: Aurelia
 * Date: 2025/2/15
 * Desc
 */

const FaucetAccountModel = require('../model/faucetAccount');
const StatisticModel = require('../model/statistics');
const moment = require('moment');

const checkAccount = async (account) => {
    const date = new Date();
    const query = {account, expiration: {$gte: date}};
    return await FaucetAccountModel.find(query).count();
};

const checkAccountForTwitter = async (account) => {
    const date = new Date();
    const query = {account, tweetExpiration: {$gte: date}};
    return await FaucetAccountModel.find(query).count();
};

const getAccount = async (account) => {
    const query = {account};
    return await FaucetAccountModel.findOne(query).lean().exec();
};

/*const setExpiration = async (account) => {
    const query = {account};
    const data = {expiration: moment().add(1, 'days').toDate()}

    if (await FaucetAccountModel.find(query).count()) {
        return FaucetAccountModel.update(query, data).exec();
    } else {
        const newdata = {...query, ...data};
        const FAEntity = new FaucetAccountModel(newdata);
        return FAEntity.save();
    }
}*/

const updateAccount = async (account) => {
    const query = {account};
    //const expiration = moment().add(1, 'days').toDate();
    // const expiration = moment(moment().add(1, 'days').format('YYYYMMDD')).toDate();
    const expiration = moment().add(4, 'hours').toDate();
    const checkIn = moment().toDate();
    const data = await FaucetAccountModel.findOne(query).lean().exec();
    const update = {expiration};
    if (data) {
        const lastCheckIn = moment(data.checkIn[data.checkIn.length - 1]);
        const hoursSinceLastCheckIn = moment().diff(lastCheckIn, 'hours');
        if (hoursSinceLastCheckIn >= 4) {
                update.checkIn = [...data.checkIn, checkIn];
                return FaucetAccountModel.update(query, update).exec();
        }
        // if (data.checkIn && parseInt(moment(data.checkIn[data.checkIn.length - 1]).format('YYYYMMDD')) + 1 === parseInt(moment().format('YYYYMMDD'))) {
        //     /* 满足续签条件 */
        //     if (data.checkIn.length === 7) {
        //         /* 签满 */
        //         update.checkIn = [checkIn];
        //     } else {
        //         update.checkIn = [...data.checkIn, checkIn];
        //     }
        // } else {
        //     /* 不满足续签条件 */
        //     update.checkIn = [checkIn];
        // }
        // return FaucetAccountModel.update(query, update).exec();
    } else {
        /* 没有记录 */
        const newdata = {...query, ...update, checkIn: [checkIn]};
        const FAEntity = new FaucetAccountModel(newdata);
        return FAEntity.save();
    }
};


const setStatistics = (account, amountobj) => {
    const obj = {
        account,
        UNIT: amountobj.unit,
        TAT: amountobj.tat,
        date: parseInt(moment().format('YYYYMMDD'))
    };
    const statisticEntity = new StatisticModel(obj);
    return statisticEntity.save();
};

const setTweetExpiration = async (account) => {
    const query = {account};
    const data = {tweetExpiration: moment(moment().add(1, 'days').format('YYYYMMDD')).toDate()};

    return FaucetAccountModel.update(query, data).exec();

};

module.exports = {checkAccount, checkAccountForTwitter, getAccount, updateAccount, setTweetExpiration, setStatistics};
