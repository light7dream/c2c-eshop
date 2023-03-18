let user = {};
let base = require('../../base');
let mysql = require('../../mysql');
let moment = require('moment');
let redis = require('../../redis');
let KEYS = require('../../redis_key');

/**
 * V2:用户登录
 * @param {*} req 
 * @param {*} res 
 */
 user.login = async (req, res) => {
    let phone = req.body.phone;
    phone = phone.replace(/\s*/g, "");
    if (!phone) {
        res.send(base.result_error("手机号不能为空"));
        return;
    }
    let pwd = req.body.pwd;
    if (!pwd) {
        res.send(base.result_error("密码不能为空"));
        return;
    }

    let sql = `SELECT * FROM user WHERE phone=?`;
    let sql_result = await mysql.query(sql, [phone]);
    if (sql_result.length == 0) {
        res.send(base.result_error("用户不存在"));
        return;
    }

    let user_info = sql_result[0];
    if (user_info.pwd_md5 === base.md5Pwd(pwd)) {
        let token = base.createToken(user_info.uid);
        sql = "UPDATE user SET token=?,last_login_time=? WHERE uid=?";
        sql_result = await mysql.query(sql, [token, moment().format("YYYY-MM-DD HH:mm:ss"), user_info.uid]);

        if (!(user_info.state > 0)) {
            res.send(base.result_error("登录失败"));
            return;
        }

        let data = Object.assign(user_info,{ token });
        let alist = await mysql.query("SELECT * FROM user_address WHERE uid=?", [user_info.uid]);
        data.address_list = alist;
        data.has_sign = data.sign ? true : false;
        delete data.pwd_md5;
        delete data.admin_pwd;
        data.roles = JSON.parse(data.roles);

        await redis.Client1.setEx(`${KEYS.TOKEN}${user_info.uid}`, 86400 * 365, JSON.stringify(data));

        res.send(base.result_ok("登录成功", data));
        return;
    }

    res.send(base.result_error("密码错误"));
    return;
};

/**
 * V2:获取用户信息
 * @param {*} req 
 * @param {*} res 
 */
user.getInfo = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

  
    let data = user_info;
    let alist = await mysql.query("SELECT * FROM user_address WHERE uid=?", [user_info.uid]);
    data.address_list = alist;
    data.has_sign = data.sign ? true : false;
    delete data.pwd_md5;
    delete data.admin_pwd;
    data.roles = data.roles || [];

    res.send(base.result_ok("ok", data));
    return;
};

module.exports = user;