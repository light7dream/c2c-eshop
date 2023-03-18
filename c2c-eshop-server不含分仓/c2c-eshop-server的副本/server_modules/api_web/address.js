let address = {};
let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');


/**
 * 获取收货地址
 * @param {*} req 
 * @param {*} res 
 */
address.getList = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let sql = "SELECT * FROM user_address WHERE uid=? ORDER BY isdefault DESC,uid ASC ";
    let sql_result = await mysql.query(sql, [user_info.uid]);
    res.send(base.result_ok("ok", sql_result));
    return;
};

/**
 * 获取收货详情
 * @param {*} req 
 * @param {*} res 
 */
address.getDetail = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let id = req.body.id;
    if (!(id > 0)) {
        res.send(base.result_error("收货信息id错误", req.body.id));
        return;
    }

    let sql = "SELECT * FROM user_address WHERE uid=? AND id=? ";
    let sql_result = await mysql.query(sql, [user_info.uid, id]);
    if (sql_result.length == 1) {
        res.send(base.result_ok("ok", sql_result[0]));
        return;
    }
    res.send(base.result_error("没有数据"))
    return;
};

/**
 * 添加收货地址
 * @param {*} req 
 * @param {*} res 
 */
address.add = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let name = req.body.name;
    if (!name) {
        res.send(base.result_error("收件人不能为空"));
        return;
    }
    let phone = req.body.phone;
    if (!phone) {
        res.send(base.result_error("手机号不能为空"));
        return;
    }
    let province = req.body.province;
    if (!province) {
        res.send(base.result_error("省份不能为空"));
        return;
    }
    let city = req.body.city;
    if (!city) {
        res.send(base.result_error("城市不能为空"));
        return;
    }
    let county = req.body.county;
    if (!county) {
        res.send(base.result_error("市、县(区)不能为空"));
        return;
    }
    let detail = req.body.detail;
    if (!detail) {
        res.send(base.result_error("地址详情不能为空"));
        return;
    }
    let isdefault = parseInt(req.body.isdefault);
    isdefault = isdefault ? 1 : 0;
    if (isdefault) {
        await mysql.query("UPDATE user_address SET isdefault=0 WHERE uid=? AND isdefault=1", [user_info.uid]);
    }

    let sql = `INSERT INTO user_address (uid,name,phone,province,city,county,detail,isdefault) VALUES (?,?,?,?,?,?,?,?)`;
    let sql_result = await mysql.query(sql, [user_info.uid, name, phone, province, city, county, detail, isdefault]);

    // 信息更新到redis
    await base.updateUserInfo(user_info.uid);

    res.send(base.result_ok("添加成功"));
    return;
};

/**
 * 修改收货地址
 * @param {*} req 
 * @param {*} res 
 */
address.update = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let id = req.body.id;
    if (!(id > 0)) {
        res.send(base.result_error("收货信息id错误", req.body.id));
        return;
    }
    let name = req.body.name;
    if (!name) {
        res.send(base.result_error("收件人不能为空"));
        return;
    }
    let phone = req.body.phone;
    if (!phone) {
        res.send(base.result_error("手机号不能为空"));
        return;
    }
    let province = req.body.province;
    if (!province) {
        res.send(base.result_error("省份不能为空"));
        return;
    }
    let city = req.body.city;
    if (!city) {
        res.send(base.result_error("城市不能为空"));
        return;
    }
    let county = req.body.county;
    if (!county) {
        res.send(base.result_error("市、县(区)不能为空"));
        return;
    }
    let detail = req.body.detail;
    if (!detail) {
        res.send(base.result_error("地址详情不能为空"));
        return;
    }

    let isdefault = parseInt(req.body.isdefault);
    if (isdefault != 0 && isdefault != 1) {
        res.send(base.result_error("收货信息没有指定是否默认地址"));
        return;
    }

    isdefault = isdefault ? 1 : 0;
    if (isdefault) {
        await mysql.query("UPDATE user_address SET isdefault=0 WHERE uid=? AND isdefault=1", [user_info.uid]);
    }

    let sql = `UPDATE user_address SET name=?,phone=?,province=?,city=?,county=?,detail=?,isdefault=? WHERE id=? AND uid=?`;
    let sql_result = await mysql.query(sql, [name, phone, province, city, county, detail, isdefault, id, user_info.uid]);

    // 信息更新到redis
    await base.updateUserInfo(user_info.uid);

    res.send(base.result_ok("更新成功"));
    return;
}

/**
 * 删除收货地址
 * @param {*} req 
 * @param {*} res 
 */
address.delete = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let id = req.body.id;
    if (!(id > 0)) {
        res.send(base.result_error("收货信息id错误", req.body.id));
        return;
    }

    let sql = "DELETE FROM user_address WHERE id=? AND uid=? ";
    let sql_result = await mysql.query(sql, [id, user_info.uid]);

    // 信息更新到redis
    await base.updateUserInfo(user_info.uid);

    res.send(base.result_ok("删除成功"));
    return;
};


module.exports = address;