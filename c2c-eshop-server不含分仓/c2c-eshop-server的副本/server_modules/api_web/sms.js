let sms = {};
let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
const redis = require('../redis');
const Core = require('@alicloud/pop-core');
// 阿里云控制台 - 短信服务 - 国内消息
// const SignName = "当代摩玛";
// const TemplateCode = "SMS_231451781";
const config = package_json.config
const SignName = config.SmsSignName || "Kasper艺术";
const TemplateCode = config.SmsTemplateCode || "SMS_242971144";

const accessKeyId = config.SmsAccessKeyId || "LTAI5t9BMh7KAAb6D6pJs8Ls";
const accessKeySecret = config.SmsAccessKeySecrect || "1nGDO7VMCQ5hFFqSpKA8r4pX6t8CmV";

var client = new Core({
    accessKeyId,
    accessKeySecret,
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
});

/**
 * 获取验证码(注册)
 * @param {*} req 
 * @param {*} res 
 */
sms.getCodeByRegister_bak = async (req, res) => {
    let phone = req.body.phone;
    if (!phone) {
        res.send(base.result_error("手机号码不正确"));
        return;
    }
    let sql = "SELECT * FROM user WHERE phone=? ";
    let sql_result = await mysql.query(sql, [phone]);
    if (sql_result.length > 0) {
        res.send(base.result_error("该手机号已被占用"));
        return;
    }
    let code = base.getRandomCode(100000, 999999).toString();

    let result = await redis.setSMScode(phone, code, 300);
    if (!result) {
        res.send(base.result_ok("验证码已发送", code));
        return;
    }

    res.send(base.result_error("验证码发送失败", code));
    return;
};

/**
 * 获取验证码(注册)
 * @param {*} req 
 * @param {*} res 
 */
sms.getCodeByRegister = async (req, res) => {
    let phone = req.body.phone;
    if (!phone) {
        res.send(base.result_error("手机号码不正确"));
        return;
    }
    let sql = "SELECT * FROM user WHERE phone=? ";
    let sql_result = await mysql.query(sql, [phone]);
    if (sql_result.length > 0) {
        res.send(base.result_error("该手机号已被占用"));
        return;
    }
    let code = base.getRandomCode(100000, 999999).toString();

    // 云通信发送
    let result = await
        client.request('SendSms', {
            RegionId: "cn-beijing",
            PhoneNumbers: phone,
            SignName,
            TemplateCode,
            TemplateParam: "{code:" + code + "}"
        }, {
            method: 'POST'
        });

    if (result.Message && result.Message == "OK" && result.Code && result.Code == "OK") { // 短信发送成功
        let result = await redis.setSMScode(phone, code, 300);
        if (!result) {
            res.send(base.result_ok("验证码已发送"));
            return;
        }
    } else {
        res.send(base.result_error("验证码发送失败"));
        return;
    }

    res.send(base.result_error("验证码发送失败"));
    return;
};


/**
 * 获取验证码(找回密码)
 * @param {*} req 
 * @param {*} res 
 */
sms.getCodeByFindPwd = async (req, res) => {
    let phone = req.body.phone;
    if (!phone) {
        res.send(base.result_error("手机号码不正确"));
        return;
    }
    let sql = "SELECT * FROM user WHERE phone=? ";
    let sql_result = await mysql.query(sql, [phone]);
    if (sql_result.length == 0) {
        res.send(base.result_error("该手机号未注册"));
        return;
    }
    let code = base.getRandomCode(100000, 999999).toString();

    client.request('SendSms', {
        RegionId: "cn-beijing",
        PhoneNumbers: phone,
        SignName,
        TemplateCode,
        TemplateParam: "{code:" + code + "}"
    }, {
        method: 'POST'
    }).then(async (result) => {
        if (result.Message && result.Message == "OK" && result.Code && result.Code == "OK") { // 短信发送成功
            let result = await redis.setSMScode(phone, code, 300);
            if (!result) {
                res.send(base.result_ok("验证码已发送"));
                return;
            }
        } else {
            res.send(base.result_error("验证码发送失败"));
            return;
        }
    }, (ex) => {
        console.log(ex);
        res.send(base.result_error("验证码发送失败"));
        return;
    });
};


// ---- private ----
/**
 * 检查验证码
 * @param {*} phone 
 * @param {*} code 
 */
sms.checkSMScode = async (phone, code) => {
    let sms = await redis.Client1.get(phone);
    // await redis.client.del(phone);
    return sms === code;
};


module.exports = sms;
