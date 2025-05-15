/**
 * Create with faucet
 * Author: Aurelia
 * Date: 2025/2/15
 * Desc
 */
const response = require('../../utils/response');
const Web3 = require('web3');
const config = require('../../config');
const moment = require('moment');
const BigNumber = require('bignumber.js');
const faucetService = require('../../service/faucetAccount');
const axios = require('axios');
// const {checkRecaptcha} = require('../../utils/recaptcha');

const web3 = new Web3(new Web3.providers.HttpProvider(config.nodeHTTP));

class Faucet {
    constructor(app) {
        app.post('/faucet/basic', this.checktime, this.addTokenBasic);
        app.post('/faucet/twitter', this.addTokenByTwitter);
        app.get('/faucet/info', this.info);
    }

    async checktime(req, res, next) {
        const {account} = req.body;
        if (!account || !web3.utils.isAddress(account)) {
            return response.returnParamError(res);
        }
        try {
            const expflag = await faucetService.checkAccount(account);
            if (expflag) {
                return response.returnSuccess(res, 'You can only claim it once every four hours!');
            } else {
                next();
            }
        } catch (e) {
            console.error(e);
            return response.returnSystemError(res);
        }
    }

    static async sendtoMQ(obj) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await axios.post(`${config.mq.host}/api/faucetProcess`, {message: JSON.stringify(obj)}, {headers: {Authorization: `Bearer ${config.mq.secretKey}`}});
                if (data.status === 200) {
                    return resolve();
                }
                return reject();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });

    }

    static async updateExpiration(account) {
        return new Promise(async (resolve, reject) => {
            try {
                await faucetService.updateAccount(account);
                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    static async setStatistics(account, amountobj) {
        return new Promise(async (resolve, reject) => {
            try{
                await faucetService.setStatistics(account,amountobj);
                return resolve();
            }
            catch(e){
                console.error(e);
                return reject(e);
            }
        });
    }

    static async updateTweetExpiration(account) {
        return new Promise(async (resolve, reject) => {
            try {
                await faucetService.setTweetExpiration(account);
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }


    static async getAmount(account) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await faucetService.getAccount(account);
                if (data) {
                    /* 已经存在 */
                    // if (data.checkIn && data.checkIn.length === 6 && parseInt(moment(data.checkIn[data.checkIn.length - 1]).format('YYYYMMDD')) + 1 === parseInt(moment().format('YYYYMMDD'))) {
                    //     /* data.checkIn 已经有6条记录 并且今天符合第7条记录的要求 */
                    //     return resolve({unit: config.basicAmount.unit * 2, tat: config.basicAmount.tat * 2});
                    // }
                    return resolve({unit: config.basicAmount.unit, tat: config.basicAmount.tat});
                }
                return resolve({unit: config.basicAmount.unit, tat: config.basicAmount.tat});

            } catch (e) {
                return reject(e);
            }
        });
    }

    async addTokenBasic(req, res) {

        // const err = await checkRecaptcha(req);
        // if (err) {
        //     return response.returnError(res, err);
        // }

        const {account} = req.body;
        if (!account || !web3.utils.isAddress(account)) {
            return response.returnParamError(res);
        }
        try {
            const obj = await Faucet.getAmount(account);
            const UNITamount = BigNumber(obj.unit).times(BigNumber(1e+18)).integerValue(1).toString();
            const TATamount = BigNumber(obj.tat).times(BigNumber(1e+18)).integerValue(1).toString();
            await Faucet.sendtoMQ({account, amount: {unit: UNITamount, tat: TATamount}});
            await Faucet.updateExpiration(account);
            await Faucet.setStatistics(account, obj);
            return response.returnSuccess(res, 'complete.');
        } catch (e) {
            console.error(e);
            return response.returnError(res, e);
        }
    }

    static async getTweetId(url) {
        const clean = url.split('?')[0];
        const id = clean.split('\/').pop();
        const username = clean.split('\/')[3];
        const reg = new RegExp(/[0-9]+/g);
        if (reg.test(id)) {
            return {id, username};
        } else {
            return null;
        }
    }

    static async getAccountFromTweetid(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const robj = await axios.get(`${config.twitter.url}/2/tweets/${id}`, {headers: {Authorization: config.twitter.authorization}});
                if (robj && robj.data && robj.data.data) {
                    const cont = robj.data.data.text;
                    const arr = cont.match(/0x[0-9a-fA-F]{40}/g);
                    if (arr.length === 0) {
                        return reject('Wrong tweet data,cannot find account infomation.');
                    }
                    return resolve(arr[0]);
                }
                return reject('Please enter the correct content！');

            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    static async getTweetidFromUsername(username) {
        return new Promise(async (resolve, reject) => {
            try {
                const robj = await axios.get(`${config.twitter.url}/2/users/by/username/${username}`, {headers: {Authorization: config.twitter.authorization}});
                if (robj && robj.data && robj.data.data) {
                    const id = robj.data.data.id;
                    return resolve(id);
                }
                return reject('Please enter the correct content！');
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    static async getFollowingUserSignlePage(id, next = null) {
        return new Promise(async (resolve, reject) => {
            let url = `${config.twitter.url}/2/users/${id}/following?max_results=100`;
            if (next) {
                url = url + `&pagination_token=${next}`;
            }
            try {
                const robj = await axios.get(url, {headers: {Authorization: config.twitter.authorization}});
                if (robj && robj.data && robj.data.data) {
                    let flag = false;
                    const arr = robj.data.data;
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i].id && arr[i].id === config.twitter.officialTweetId) {
                            flag = true;
                            break;
                        }
                    }
                    if (flag) {
                        return resolve({result: true});
                    } else {
                        /*if (robj.data.meta && robj.data.meta.next_token) {
                            return await Faucet.getFollowingUser(id, robj.data.meta.next_token);
                        } else {
                            return reject("You have not followed the official account");
                        }*/
                        if (robj.data.meta && robj.data.meta.next_token) {
                            return resolve({result: false, np: robj.data.meta.next_token});
                        } else {
                            return resolve({result: false});
                        }
                    }
                }
                return reject('Please enter the correct content！');
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    static async getFollowingUser(id, next = null) {
        try {
            const {result, np} = await Faucet.getFollowingUserSignlePage(id, next);
            if (!result && np) {
                return await Faucet.getFollowingUser(id, np);
            } else {
                return result;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    static async checkAccountFromTweetIsAvailble(account) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await faucetService.getAccount(account);
                if (data && data.checkIn && parseInt(moment(data.checkIn[data.checkIn.length - 1]).format('YYYYMMDD')) === parseInt(moment().format('YYYYMMDD'))) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    async addTokenByTwitter(req, res) {

        // const err = await checkRecaptcha(req);
        // if (err) {
        //     return response.returnError(res, err);
        // }

        const {url} = req.body;
        const tweeturlRULE = new RegExp(/^https:\/\/twitter.com\/([a-zA-Z0-9_]+\/)status\/([0-9]+)/g);
        if (!url || !tweeturlRULE.test(url)) {
            return response.returnParamError(res);
        }
        try {
            const {id/*, username*/} = await Faucet.getTweetId(url);
            if (!id) {
                /* 无法查询tweetId */
                return response.returnSystemError(res);
            }
            /* 通过username查询userid */
            /*const userid = await Faucet.getTweetidFromUsername(username);*/
            /* 查询following列表 */
            /*if (await Faucet.getFollowingUser(userid)) {*/
            /* 已经关注 */
            const account = await Faucet.getAccountFromTweetid(id);
            if (await Faucet.checkAccountFromTweetIsAvailble(account)) {
                if (await faucetService.checkAccountForTwitter(account)) {
                    return response.returnSuccess(res, 'A link can only get once a day!');
                }
                const obj = await Faucet.getAmount(account);
                const UNITamount = BigNumber(obj.unit).times(BigNumber(1e+18)).integerValue(1).toString();
                const TATamount = BigNumber(obj.tat).times(BigNumber(1e+18)).integerValue(1).toString();
                await Faucet.sendtoMQ({account, amount: {unit: UNITamount, tat: TATamount}});
                await Faucet.updateTweetExpiration(account);
                await Faucet.setStatistics(account, obj);
                return response.returnSuccess(res, 'complete.');
            } else {
                return response.returnSuccess(res, 'You need to claim tokens before you can get additional tokens by sharing tweets.');
            }
            /*} else {
                return response.returnSuccess(res, "You have not followed the official account.");
            }*/

        } catch (e) {
            console.error(e);
            return response.returnError(res, e);
        }
    }

    async info(req, res) {
        const {account} = req.query;
        if (!account || !web3.utils.isAddress(account)) {
            return response.returnParamError(res);
        }
        try {
            const data = await faucetService.getAccount(account);
            return response.returnSuccess(res, data);
        } catch (e) {
            console.error(e);
            return response.returnError(res, e);
        }

    }

}

module.exports = Faucet;
