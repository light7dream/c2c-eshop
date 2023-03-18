
var qr = require('qr-image');
let config = require('../package.json').config;
let fs = require('fs');
let gm = require("gm");
const { env } = require('process')

let wx_pay = require('./wx_pay');

var co = require('co');
var OSS = require('ali-oss');
var client = new OSS({
    region: config.OssRegion,
    accessKeyId: config.OssAccessKeyId,
    accessKeySecret: config.OssAccessKeySecret,
    bucket: config.OssBucket
});


let qr_code = {};

// ---- private ----
/**
 * 生成二维码图片流
 * @param {*} content 
 * @param {*} type 
 * @param {*} size 
 * @param {*} margin 
 * @returns 
 */
qr_code.createQr = function (content, type = 'png', size = 8, margin = 2) {
    let qr_png = qr.image(content, { type: type, size: size, margin: margin });
    return qr_png;
};

/**
 * 上传二维码
 * @param {*} uid 
 * @param {*} fileData 
 * @param {*} callback 
 */
qr_code.upload = function (uid, fileData) {
    return new Promise((resolve, reject) => {
        co(function* () {
            var result = yield client.put('qr-code/' + uid + `_qr_${Date.now()}.jpg`, fileData);
            resolve(result);
        }).catch(function (err) {
            console.log(`${uid} 二维码上传失败`);
            reject(err);
        });
    });
};

/**
 * 合成二维码
 * @param {*} bucketPath 
 * @param {*} filepath 
 * @param {*} uid 
 */
qr_code.combineQr = async (qr, avatar, uid) => {
    let cacheFile = __dirname + "/cache_img/" + uid + '.jpg';
    return new Promise((resolve, reject) => {
        gm(qr)
            .command("composite")
            .in("-gravity", "NorthWest")
            .in('-geometry', '50x50+140+140')
            .in(avatar)
            .write(cacheFile, function (err) {
                if (!err) {
                    resolve({
                        result: true,
                        data: cacheFile
                    });
                }
                else {
                    console.log('合成Qr失败');
                    console.log(err);
                    resolve({
                        result: false,
                        data: err
                    });
                }
            });
    });
};

/**
 * 上传本地合成二维码
 * @param {*} bucketPath 
 * @param {*} filepath 
 * @param {*} uid 
 */
qr_code.uploadLocalFile = async (filepath, uid) => {
    return new Promise((resolve, reject) => {
        let cacheFile = __dirname + "/cache_img/" + uid + '.jpg';
        co(function* () {
            var result = yield client.put('qr-code/' + uid + '_qr.jpg', filepath);
            resolve({
                result: true,
                data: result
            });
            console.log(cacheFile, filepath);
            fs.unlink(filepath, function (err) {
                if (err) {
                    return;
                }
            });
        }).catch(function (err) {
            resolve({
                result: true,
                data: err
            });
        });
    });

};


// 重新生成二维码
qr_code.qrTest = async function (req, res) {
    let handle_key = req.body.handle_key;

    if (handle_key == "DigiCostarHU") {
        let mysql = require('./mysql');
        let base = require('./base');
        let user = await mysql.query("SELECT * FROM user");
        for (let i = 0; i < user.length; i++) {
            let qr_data = `${env.register_url || config.register_url}?rid=${user[i].uid}`;
            let qrFileData = qr_code.createQr(qr_data);
            let result = await qr_code.upload(user[i].uid, qrFileData);
            // let qr_url = result.url;
            let qr_url = result.url.replace('http://', 'https://')
            await mysql.query("UPDATE user SET qrcode=? WHERE uid=?", [qr_url, user[i].uid]);
        }

        res.send("用户二维码生成成功");
    } else {
        res.send("你个小坏蛋...");
    }

};

module.exports = qr_code;