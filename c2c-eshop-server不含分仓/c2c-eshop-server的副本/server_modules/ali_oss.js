'use strict';

var base = require('./base');
let config = require('../package.json').config;
var moment = require('moment');
var crypto = require('crypto');
var request = require('request');
var uuid = require('uuid/v1');
var path = require('path');



const accessKeyID = config.OssAccessKeyId;
const accessKeySecret = config.OssAccessKeySecret;

var oss = {};

//获取oss签名
oss.get_sign = async function (req, res) {
    var content_type = req.body.content_type;
    var date = req.body.date;
    var bucket = req.body.bucket;
    var dir = req.body.dir;
    var filename = req.body.filename;
    var type = req.body.type;

    // console.log(req.body);

    if (!date || !dir || !bucket || !type || !filename) {
        res.send(base.result_error("签名参数错误"));
        return;
    }
    type = type.toLowerCase();
    if (type != 'put' && type != 'post' && type != 'get') {
        res.send(base.result_error("方法类型错误"));
        return;
    }

    var new_filename = dir + "/" + uuid().replace(/-/g, "") + path.extname(filename);

    if (type == "put") {
        var code = "PUT\n\n" + content_type + "\n" + date + "\n/" + bucket + "/" + new_filename;
        var sign = crypto.createHmac('sha1', accessKeySecret).update(code).digest().toString('base64');
        var data = { accessKeyID, filename: new_filename, sign };
        res.send({ res_code: 1, msg: data });
    }
    if (type == "post") {
        var policy = {
            "expiration": moment().add(1, 'days'),
            "conditions": [{ "bucket": bucket }]
        };

        var policyBase64 = new Buffer.from(JSON.stringify(policy)).toString('base64');
        var sign = crypto.createHmac('sha1', accessKeySecret).update(policyBase64).digest().toString('base64');

        var data = {
            accessKeyID,
            filename: new_filename,
            policyBase64,
            sign
        };
        res.send({ res_code: 1, msg: data });
    }
    if (type == "get") {
        var expires = moment().add(1, "days").unix();
        var param = oss.get_url_sign(expires, bucket, new_filename);
        var data = { param };
        res.send({ res_code: 1, msg: data });
    }
};

//方法-----------------------------------------------------
//获取url签名
oss.get_url_sign = function (expires, bucket, filename) {
    var code = "GET\n\n\n" + expires + "\n/" + bucket + "/" + filename;
    var sign = crypto.createHmac('sha1', accessKeySecret).update(code).digest().toString('base64');
    var param = "?OSSAccessKeyId=" + accessKeyID + "&Expires=" + expires + "&Signature=" + encodeURIComponent(sign);
    return param;
};

module.exports = oss;