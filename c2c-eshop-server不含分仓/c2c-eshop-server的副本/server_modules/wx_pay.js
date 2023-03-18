// import WxPay from 'wechatpay-node-v3'; // 支持使用require
// import fs from 'fs';
// import request from 'superagent';
let WxPay = require('wechatpay-node-v3');
let fs = require('fs');
let request = require('request');
let base = require('./base');
var md5 = require('md5');
let moment = require('moment');
let crypto = require('crypto');
let mysql = require('./mysql');
let config = require('../package.json').config

let wxConfig = {
    appid: config.WxPayAppId || 'wx4f19265180ae4075',//直连商户申请的公众号或移动应用appid
    appsecret: config.WxPayAppSecret || '5bc83f7677d2c35c1c3cb5bf12a4af42',
}

const pay = new WxPay({
    appid: config.WxPayAppId || 'wx4f19265180ae4075',//直连商户申请的公众号或移动应用appid
    mchid: config.WxPayMchId || '1618486151',//商户号
    publicKey: fs.readFileSync(__dirname + '/cert/apiclient_cert.pem'), // 公钥
    privateKey: fs.readFileSync(__dirname + '/cert/apiclient_key.pem'), // 秘钥
});
const apiv3_secret = config.WxApiV3Secret || "dkiu34jdDFUENX8uejfhgsiugjtrzldk"; // apiv3支付密钥，回调解密使用

let wx_pay = {};

/**
 * 获取Token
 * @param {*} req 
 * @param {*} res 
 */
wx_pay.getToken = function (req, res) {
    wx_pay.get_token().then(function (token) {
        res.send(base.result_error("ok", token));
    }, function (error) {
        console.log('--- 获取Token失败 ---');
        console.log(error);
        res.send(base.result_error("获取token失败", error));
    });
};

/**
 * 获取签名
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
wx_pay.getSign = function (req, res) {
    //console.log("in");
    let url = req.body.url;
    if (!url) {
        res.send(base.result_error("签名地址错误", url));
        return;
    }
    wx_pay.get_token().then(function (token) {
        //console.log("token:"+token);
        wx_pay.get_ticket(token).then(function (ticket) {
            let result = wx_pay.get_jssdk_sign(ticket, url);
            res.send(base.result_error("ok", result));
        }, function (error) {
            console.log('--- 签名时获取ticket失败 ---');
            console.log(error);
            res.send(base.result_error("获取签名失败", error));
        });
    }, function (error) {
        console.log('--- 签名时获取Token失败 ---');
        console.log(error);
        res.send(base.result_error("获取签名失败", error));
    });
};

/**
 * 支付回调
 */
wx_pay.paycallback = async (req, res) => {
    console.log('---- pay call back ----')
    // console.log(req.body);

    const result = pay.decipher_gcm(req.body.resource.ciphertext, req.body.resource.associated_data, req.body.resource.nonce, apiv3_secret);
    // console.log('解密');
    // console.log(result);

    if (result && result.out_trade_no) {
        let out_trade_no = result.out_trade_no;
        let att = { uid: 0, mode: "home" };
        try {
            att = JSON.parse(result.attach);
        } catch {
            console.log('json err')
            console.log(result);
        }
        await wx_pay.updateGood(out_trade_no, att.mode);
        res.send({
            "code": "SUCCESS",
            "message": "成功"
        });
        console.log('success')
    } else {
        res.send({
            "code": "ERROR",
            "message": "成功"
        });
        console.log('error')
        console.log(result)
    }
};

wx_pay.updateGood = async (order_no, goods_tag) => {
    if (goods_tag == "home") {
        let order_info = await mysql.query("SELECT * FROM user_order_shelves WHERE order_no=?", order_no);
        if (order_info.length == 0) {
            console.log(`没有查询到订单 ${order_no}`);
            return;
        }
        order_info = order_info[0];
        let list = JSON.parse(order_info.goods_info);

        for (let i = 0; i < list.length; i++) {
            await mysql.query("UPDATE goods_shelves SET count=count-? WHERE gid=?", [list[i].count, list[i].gid]);
        }
        await mysql.query("UPDATE user_order_shelves SET pay_state=1 WHERE order_id=? AND uid=?", [order_info.order_id, order_info.uid]);
        return base.result_ok("ok");
    } else {
        let order_info = await mysql.query("SELECT * FROM user_order_publish WHERE order_no=?", order_no);
        if (order_info.length == 0) {
            return base.result_error("没有查询到订单");
        }
        order_info = order_info[0];
        let sql = "UPDATE goods_rush SET state=1,last_price=price,price=?,publish_order_no=? WHERE gid=? AND state=0 AND belong=?";
        let sql_result = await mysql.query(sql, [order_info.newprice, order_no, order_info.gid, order_info.uid]);

        // 更新原抢购用户订单状态
        let goods_rush_info = await mysql.query("SELECT * FROM goods_rush WHERE gid=? AND belong=?", [order_info.gid, order_info.uid]);
        goods_rush_info = goods_rush_info[0];
        await mysql.query("UPDATE user_order SET pay_state=2 WHERE order_id=?", [goods_rush_info.current_order_id]);

        await base.updateUserBelong([order_info.uid]);
        await mysql.query("UPDATE user_order_publish SET pay_state=1 WHERE order_no=? AND uid=?", [order_info.order_no, order_info.uid]);
        return base.result_ok("ok");
    }
};

// ---- new func ----
wx_pay.get_v3_sign = function (ret) {
    var code = "app_id=" + wxConfig.appid + "&noncestr=" + ret.nonceStr + "&timestamp=" + ret.timestamp + "&package=" + ret.package;
    ret.paySign = crypto.createHash('sha1').update(code).digest('hex');
    return ret;
};

/**
 * 获取支付参数v3
 * @param {*} description 
 * @param {*} order_no 
 * @param {*} total_fee 
 * @param {*} openid 
 * @param {*} uid 
 * @param {*} goods_tag 
 * @returns 
 */
wx_pay.getPay = async (description, order_no, total_fee, openid, uid, goods_tag) => {

    // 测试代码，上线删除
    // total_fee = 1;

    if (!goods_tag) {
        goods_tag = "Home";
    }

    let params = {
      description: description,
      out_trade_no: order_no,
      notify_url: config.WxPayNotifyUrl || 'https://wx.meetmoma.com/web/wxcallback',
      amount: {
        total: total_fee,
      },
      attach: JSON.stringify({
        uid,
        mode: goods_tag,
      }),
      payer: {
        openid: openid,
      },
    }
    const result = await pay.transactions_jsapi(params);
    // console.log(result);
    return result;
};


// ---- private ----

/**
 * 获取微信open_id
 * */
wx_pay.getopenid = async (req, res) => {
    let body = req.body
    const wx_code = Object.keys(body)[0]
    console.log('🚀 ~ file: wx_pay.js ~ line 185 ~ wx_pay.getopenid= ~ wx_code', wx_code)
    let data = {}
    if (wx_code) {
        data = await wx_pay.getopenidFun(wx_code)
    }
    res.send(data)
}

wx_pay.getopenidFun = async function (wx_code) {
    return new Promise(function (resolve, reject) {
        if (wx_code == null || wx_code == "" || wx_code == "test") {
            resolve({ res_code: -1, msg: "微信支付code不能为空" });
            return;
        }
        let url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + wxConfig.appid + "&secret=" + wxConfig.appsecret + "&code=" + wx_code + "&grant_type=authorization_code";
        request(url, function (error, response, body) {
            if (error || response.statusCode != 200) {
                resolve({ res_code: -1, msg: "获取open_id失败", data: error });
                return;
            }
            var wx_info = JSON.parse(body);
            if (wx_info.errcode > 0) {
                resolve({ res_code: -1, msg: "获取open_id 转换失败", data: wx_info });
                return;
            }
            resolve({ res_code: 1, msg: "ok", data: wx_info });
        });
    });
};

//获取token
wx_pay.get_token = function () {
    return new Promise(function (resolve, reject) {
        if (!token || moment().unix() >= token_ex_time) {
            var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + wxConfig.appid + "&secret=" + wxConfig.appsecret;
            request(url, function (error, response, body) {
                if (error || response.statusCode != 200) {
                    reject(error);
                    return;
                }
                var json = JSON.parse(body);
                token = json.access_token;
                token_ex_time = moment().unix() + Number(json.expires_in) - 500;
                resolve(token);
            });
        } else {
            resolve(token);
        }
    });
};

//微信支付sign
wx_pay.pay_sign = function (param) {
    var querystring = Object.keys(param).filter(function (key) {
        return param[key] !== undefined && param[key] !== '' && ['pfx', 'partner_key', 'sign', 'key'].indexOf(key) < 0;
    }).sort().map(function (key) {
        return key + '=' + param[key];
    }).join("&") + "&key=" + pay_key;

    var sign = md5(querystring).toUpperCase();
    return sign;
};

//获取ticket
wx_pay.get_ticket = function (token) {
    return new Promise(function (resolve, reject) {
        if (!ticket || moment().unix() >= ticket_ex_time) {
            var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + token + "&type=jsapi";
            request(url, function (error, response, body) {
                if (error || response.statusCode != 200) {
                    reject(error);
                    return;
                }
                var json = JSON.parse(body);
                ticket = json.ticket;
                ticket_ex_time = moment().unix() + Number(json.expires_in) - 500;
                resolve(ticket);
            });
        } else {
            resolve(ticket);
        }
    });
};

wx_pay.createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
};

wx_pay.createTimestamp = function () {
    return moment().unix() + '';
};

wx_pay.get_jssdk_sign = function (ticket, url) {
    var ret = {
        app_id: wxConfig.appid,
        nonceStr: wx_pay.createNonceStr(),
        timestamp: wx_pay.createTimestamp()
    };
    var code = "jsapi_ticket=" + ticket + "&noncestr=" + ret.nonceStr + "&timestamp=" + ret.timestamp + "&url=" + url;
    ret.sign = crypto.createHash('sha1').update(code).digest('hex');
    return ret;
};

/**  
 * 查询订单 TODO 待更新  https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml
 * 返回参数-成功: {code: 1, msg: result};
 * 返回参数-失败: {code: 0, msg: result};
 * 返回参数-错误: {code: -2, msg: result}
 * msg 是微信接口原始数据或错误数据
 */
wx_pay.orderquery = function (out_trade_no) {
    return new Promise(function (resolve, reject) {
        var param = {
            appid: wxConfig.appid,
            mch_id: mch_id,
            nonce_str: wx_pay.createNonceStr(),
            out_trade_no: out_trade_no,
            sign_type: "MD5"
        };

        param.sign = wx_pay.pay_sign(param);
        var builder = new xml2js.Builder();
        var xml = builder.buildObject({ xml: param });
        var url = "https://api.mch.weixin.qq.com/pay/orderquery";
        request.post({ url: url, form: xml }, function (err, httpResponse, body) {
            if (err) {
                resolve({ code: -2, msg: err });
                console.log("-----查询订单err-----" + out_trade_no);
                console.log(err);
                return;
            }
            var parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false });
            parser.parseString(body, function (err, result) {
                if (result.return_code == "SUCCESS" && result.result_code == "SUCCESS") {
                    resolve({ code: 1, msg: result });
                } else {
                    resolve({ code: 0, msg: result });
                }
            });
        });
    });
};


module.exports = wx_pay;