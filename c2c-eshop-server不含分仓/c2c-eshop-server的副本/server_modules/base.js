'use strict';
let jwt = require('jwt-simple');
let crypto = require('crypto');
let moment = require('moment');
// let nodemailer = require("nodemailer");
let mysql = require('./mysql');
let config = require('../package.json').config;
let KEYS = require('./redis_key');
let redis = require('./redis');

let base = {};

//生成随机数
base.getRandomCode = function (min, max) {
    let code = Math.floor(Math.random() * (max - min + 1) + min);
    return code.toString();
};

//md5密码加密
base.md5Pwd = function (password) {
    let md5Pwd = crypto.createHash('md5').update(password).digest('hex');
    return md5Pwd;
};

// 加密
base.encrypt = (data, key = 'thiSisADthiSisAD', iv = 'IdONeTknIdONeTkn') => {
    let decipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    // decipher.setAutoPadding(true);
    return decipher.update(data, 'binary', 'base64') + decipher.final('base64');
}

// 解码
base.decrypt = (crypted, key = 'thiSisADthiSisAD', iv = 'IdONeTknIdONeTkn') => {
    crypted = new Buffer.from(crypted, 'base64').toString('binary');
    let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    return decipher.update(crypted, 'binary', 'utf8') + decipher.final('utf8');
}

//生成token
base.createToken = function (userid) {
    let expires = moment().add(config.token_expire, 'days').valueOf();
    let token = jwt.encode({
        uid: userid,
        exp: expires
    }, config.token_salt);
    return token;
};

//生成token带权限
base.createTokenWithRole = function (userid, role_id) {
    let expires = moment().add(config.expires, 'days').valueOf();
    let token = jwt.encode({
        uid: userid,
        exp: expires,
        role_id: role_id
    }, config.token_salt);
    return token;
};

//检查token
base.checkToken = async function (req) {
    let token = base.get_token(req);
    if (token) {
        try {
            let decoded = jwt.decode(token, config.token_salt);
            if (!decoded.uid) {
                return base.result_user_error("token错误");
            }
            // 20220124 临时解决
            //过期
            // if (decoded.exp <= Date.now()) {
            //     return base.result_user_error("登录已过期");
            // }

            let user_info = null;

            // 先从Redis中获取，没有的话再查数据库
            let radata = await redis.Client1.get(`${KEYS.TOKEN}${decoded.uid}`);
            if (radata) {
                user_info = JSON.parse(radata);
            } else {
                console.log('------ why null ---');
                console.log(decoded.uid, token, radata);
                let sql = `SELECT * FROM user WHERE uid=?`;
                let user_info = await mysql.query(sql, [decoded.uid]);

                if (user_info.length == 0) {
                    return base.result_user_error("没有找到用户");
                } else {
                    user_info = user_info[0];
                    delete user_info.pwd_md5;
                    delete user_info.admin_pwd;
                    user_info.roles = JSON.parse(user_info.roles);
                    let alist = await mysql.query("SELECT * FROM user_address WHERE uid=?", [user_info.uid]);
                    user_info.address_list = alist;
                    await redis.Client1.setEx(`${KEYS.TOKEN}${decoded.uid}`, 86400 * 10, JSON.stringify(user_info));
                }
            }

            if (user_info.token == token) {
                if (!(user_info.state > 0)) {
                    return base.result_user_error("登录失败");
                }
                return base.result_ok("登录验证成功", user_info);
            } else {
                // 20220124 临时解决
                // return base.result_ok("登录验证成功", user_info);
                return base.result_user_error("登录已失效，请重新登录");
            }
        } catch (err) {
            return base.result_user_error("用户登录验证异常", err);
        }
    } else {
        return base.result_user_error("用户未登录");
    }
};

//检查token
base.checkAdminToken = async function (req) {
    let token = base.get_admin_token(req);
    if (token) {
        try {
            let decoded = jwt.decode(token, config.token_salt);
            if (!decoded.uid) {
                return base.result_user_error("token错误");
            }

            //过期
            if (decoded.exp <= Date.now()) {
                return base.result_user_error("登录已过期");
            }

            let user_info = null;

            // 先从Redis中获取，没有的话再查数据库
            let radata = await redis.Client1.get(`${KEYS.ADMIN_TOKEN}${decoded.uid}`);
            if (radata) {
                user_info = JSON.parse(radata);
            } else {
                let sql = `SELECT * FROM user WHERE uid=?`;
                let user_info = await mysql.query(sql, [decoded.uid]);

                if (user_info.length == 0) {
                    return base.result_user_error("没有找到用户");
                } else {
                    user_info = user_info[0];
                    delete user_info.pwd_md5;
                    delete user_info.admin_pwd;
                    user_info.roles = JSON.parse(user_info.roles);
                    let alist = await mysql.query("SELECT * FROM user_address WHERE uid=?", [user_info.uid]);
                    user_info.address_list = alist;

                    let bucket_data = await base.checkUserRange(user_info);
                    user_info.isbucket = bucket_data.isbucket;
                    user_info.members = bucket_data.members;
                    await redis.Client1.setEx(`${KEYS.ADMIN_TOKEN}${decoded.uid}`, 86400 * 10, JSON.stringify(user_info));
                }
            }

            if (user_info.admin_token == token) {
                if (!(user_info.state > 0)) {
                    return base.result_user_error("登录失败");
                }
                if (user_info.roles.indexOf(1) == -1) {
                    return base.result_user_error("登录失败");
                }
                return base.result_ok("登录验证成功", user_info);
            } else {
                return base.result_user_error("登录已过期，请重新登录");
            }
        } catch (err) {
            return base.result_user_error("用户登录验证异常", err);
        }
    } else {
        return base.result_user_error("用户未登录");
    }
};

/**
 * 检查管理员成员范围
 * @param {*} user_info 管理员信息
 */
base.checkUserRange = async (user_info) => {
    let isbucket = false;
    let members = [];
    if (user_info.roles.indexOf(2) > -1) {
        isbucket = true;
        let buckets = await mysql.query("SELECT * FROM user_bucket WHERE admin_uid=?", [user_info.uid]);
        buckets.forEach(b => {
            members = members.concat(JSON.parse(b.members));
        });
        members = Array.from(new Set(members));
    }
    return { isbucket, members }
};

//获取token
base.get_token = function (req) {
    // console.log(req.cookies);
    // let token = req.cookies[config.token_prop_name];
    // if (!token) {
    const token = req.body.token;
    // }
    return token;
};

//获取后端管理token
base.get_admin_token = function (req) {
    // console.log(req.cookies);
    let token = req.cookies[config.token_prop_name_admin];
    if (!token) {
        token = req.body.token;
    }
    return token;
};

// 返回错误
base.result_error = function (msg, data) {
    return { res_code: -1, msg, data };
}

// 返回错误
base.result_user_error = function (msg, data) {
    return { res_code: -900, msg, data };
}

// 返回警告
base.result_warning = function (msg, data) {
    return { res_code: 0, msg, data };
}

// 返回正确
base.result_ok = function (msg, data) {
    return { res_code: 1, msg, data };
}

// 检查并赋值分页参数
base.checkPageParam = function (param) {
    if (param.page_index == null || param.page_index < 0) {
        param.page_index = 0;
    }
    if (param.page_size == null || param.page_size < 1) {
        param.page_size = 10;
    }
    param.limit = param.page_index * param.page_size;
    return param;
}

// 检查学员用户
base.checkStudent = (user_info) => {
    if (user_info.is_student == 1) {
        return { result: true, msg: "ok" };
    }
    return { result: false, msg: "不是学员用户" };
};

// 检查教师用户
base.checkTeacher = (user_info) => {
    if (user_info.is_teacher == 1) {
        return { result: true, msg: "ok" };
    }
    return { result: false, msg: "不是教师用户" };
};

/*
 * 删除数组中指定值
 */
Array.prototype.remove = function (value) {
    let len = this.length;
    for (let i = 0, n = 0; i < len; i++) {//把出了要删除的元素赋值给新数组
        if (this[i] != value) {
            this[n++] = this[i];
        } else {
            //console.log(i);//测试所用
        }
    }
    this.length = n;
};

//对象数组排序
//示例 let arr=[{a:1},{a:2}];
//arr.sort(base.array_compare("a"));
base.array_compare = function (property, type) {
    return function (obj1, obj2) {
        let value1 = obj1[property];
        let value2 = obj2[property];
        if (type == "asc") return value1 - value2;     // 升序
        if (type == "desc") return value2 - value1;     // 降序
    }
};

//时间对象数组排序
//示例 let arr=[{a:1},{a:2}];
//arr.sort(base.array_compare("a"));
base.array_compare_by_datetime = function (property, type) {
    return function (obj1, obj2) {
        let value1 = new Date(obj1[property]);
        let value2 = new Date(obj2[property]);
        if (type == "asc") return value1 - value2;     // 升序
        if (type == "desc") return value2 - value1;     // 降序
    }
};

//过滤script标签
base.replaceScript = function (value) {
    if (!value) {
        return value;
    }

    value = value.toString();

    value = value.replace(/<script[\s\S]*?<\/script>/g, "");
    value = value.replace(/<script[\s\S]*?\/>/g, "");
    value = value.replace(/<iframe[\s\S]*?<\/iframe>/g, "");
    value = value.replace(/<iframe[\s\S]*?\/>/g, "");
    return value;
};

/**
 * 质朴长存法 数组转字符串补0
 * @param num 数字
 * @param n 指定位数
 */
base.pad = function (num, n) {
    let len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num;
};

/**
 * 自调用函数
 * 用户token校验解析 默认req.body.token
 * 用户携带token做校验
 * @returns {Function}
 */
base.checkTokenMiddleware = (() => {
    return async function (req, res, next) {
        let token = base.get_token(req);
        let result = await base.checkToken(token);
        if (result.res_code != 1) {
            res.send(result);
        } else {
            req.__userInfo = result.msg;
            next();
        }
    }
})();

/**
 * 更新用户信息
 */
base.updateUserInfo = async (uid, admin) => {
    // 信息更新到redis
    let user_info = await mysql.query("SELECT * FROM user WHERE uid=?", [uid]);
    if (user_info.length > 0) {
        user_info = user_info[0];

        delete user_info.pwd_md5;
        delete user_info.admin_pwd;
        user_info.roles = JSON.parse(user_info.roles);
        let alist = await mysql.query("SELECT * FROM user_address WHERE uid=?", [uid]);
        user_info.address_list = alist;

        if (admin) {
            let bucket_data = await base.checkUserRange(user_info);
            user_info.isbucket = bucket_data.isbucket;
            user_info.members = bucket_data.members;
            await redis.Client1.setEx(`${KEYS.ADMIN_TOKEN}${uid}`, 86400 * 10, JSON.stringify(user_info));
        }

        await redis.Client1.setEx(`${KEYS.TOKEN}${uid}`, 86400 * 10, JSON.stringify(user_info));
    }
}

/**
 * 更新所有用户信息
 */
base.updateAllUserInfo = async (uids) => {
    if (uids.length > 0) {
        for (let i = 0; i < uids.length; i++) {
            let uid = uids[i];
            // 信息更新到redis
            let user_info = await mysql.query("SELECT * FROM user WHERE uid=?", [uid]);
            if (user_info.length > 0) {
                user_info = user_info[0];

                delete user_info.pwd_md5;
                delete user_info.admin_pwd;
                user_info.roles = JSON.parse(user_info.roles);
                let alist = await mysql.query("SELECT * FROM user_address WHERE uid=?", [uid]);
                user_info.address_list = alist;

                await redis.Client1.setEx(`${KEYS.TOKEN}${uid}`, 86400 * 10, JSON.stringify(user_info));
            }
        }
    }

}

/**
 * 更新用户发布的商品
 */
base.updateUserBelong = async (uids) => {
    if (uids.length > 0) {
        for (let i = 0; i < uids.length; i++) {
            let uid = uids[i];
            // 更新用户发布商品
            let data = await mysql.query("SELECT gid FROM goods_rush WHERE belong=? AND state IN (0,1,2,3)", [uid]);
            let gidList = data.map(d => {
                return d.gid;
            });
            await redis.Client2.hDel(`${KEYS.USER_BELONG}`, `${uid}`);
            let map = new Map();
            map.set(`${uid}`, JSON.stringify(gidList));
            await redis.Client2.hSet(KEYS.USER_BELONG, map);
        }
    }
}

/**
 * 记录管理员日志
 * @param {*} uid 
 */
base.logAdmin = async (uid, handle, info) => {

    await mysql.query("INSERT INTO z_log SET type=2,log=?", [JSON.stringify({ uid, handle, info })]);
};

module.exports = base;