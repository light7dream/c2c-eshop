/**
 * 阿里云OSS相关
 */
let oss = {};
let config = require('../../package.json').config;
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
const { v4: uuidv4 } = require('uuid');

let AliOss = require('./lib/AliOss');

const OSS = require('ali-oss');
const client = new OSS({
    region: config.OssRegion,
    accessKeyId: config.OssAccessKeyId,
    accessKeySecret: config.OssAccessKeySecret,
    bucket: config.OssBucket
});

/**
 * 获取上传文件地址
 * @param {*} req 
 * @param {*} res 
 */
oss.getAuth = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;
    let authType = req.body.authType;

    let dirName = '';
    let fileName = '';
    switch (authType) {
        case 'sign':
            dirName = 'user-sign';
            fileName = `${user_info.uid}.png`
            break;
        case 'user-avatar':
            dirName = 'avatar';
            fileName = `${user_info.uid}.png`
            break;
        case 'user-pay':
            let order_id = parseInt(req.body.order_id);
            if (!(order_id > 0)) {
                res.send({ success: false });
                return;
            }
            dirName = `user-pay/${user_info.uid}/${order_id}`;
            fileName = `${moment().format('YYYYMMDDHHmmss')}.png`
            break;
        case 'wxpay-receipt-code':
            dirName = 'wxpay-receipt-code';
            fileName = `wxpay-${user_info.uid}-${uuidv4()}.png`
            break;
        case 'alipay-receipt-code':
            dirName = 'alipay-receipt-code';
            fileName = `alipay-${user_info.uid}-${uuidv4()}.png`
            break;
        default:
            res.send({ success: false });
            return;
    }

    let oss = new AliOss({
      accessKeyId: config.OssAccessKeyId,
      accessKeySecret: config.OssAccessKeySecret,
      region: config.OssRegion,
      bucket: config.OssBucket,
    //   rolearn: 'acs:ram::1482939127675027:role/ramosstest',
      rolearn: config.OssRoleArn || 'acs:ram::1482939127675027:role/ramosstest',
      endpoint: 'oss-cn-beijing.aliyuncs.com',
    })
    oss.GetWriteSTS(`${dirName}/${fileName}`, 15 * 60, uuidv4(), async function (data) {
        res.send({ success: true, data: data });
        return;
    });
};

// ---- private ----

module.exports = oss;


