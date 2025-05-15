/**
 * Create with servicePlatform
 * Author: Aurelia
 * Date: 2022/4/6
 * Desc
 */

const getMongooseSort = ({sortField = '_id', sequence = 'DESC'}) => {
    const sort = {};
    sort[sortField] = (sequence.toUpperCase() === 'ASC') ? 1 : -1;
    return sort;
};

const getMongosseQueryIn = (str) => {
    let arr = [...str];
    arr = arr.map(v => {
        if (+v) {
            return +v;
        } else {
            return v;
        }
    });
    return {$in: arr};
};

module.exports = {
    getMongooseSort, getMongosseQueryIn
};
