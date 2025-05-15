/*
 * @Description: 返回值规范
 * @Autor: Aurelia
 * @Date: 2025-2-15
 */
const codeMap = require('../dict').response;

const returnSuccess = (res, data) => {
    return res.json({
        code: codeMap.commonSuccess,
        result: data
    });
};

const returnError = (res, err) => {
    return res.json({
        code: codeMap.commonError,
        error: err
    });
};

const returnSystemError = (res) => {
    return res.json({
        code: codeMap.systemError,
        error: 'System Error.'
    });
};

const returnParamError = (res) => {
    return res.json({
        code: codeMap.paramError,
        error: 'Param Error.'
    });
};

const returnReloginError = (res) => {
    return res.json({
        code: codeMap.relogin,
        error: 'please relogin.'
    });
};

const returnPermissionError = (res) => {
    return res.json({
        code: codeMap.permissionError,
        error: 'Permission error.'
    });
};

module.exports = {
    returnSuccess, returnError, returnSystemError, returnParamError, returnReloginError, returnPermissionError
};
