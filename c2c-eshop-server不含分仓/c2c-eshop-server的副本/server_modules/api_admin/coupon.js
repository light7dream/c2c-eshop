let coupon = {};

let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');

/**
 * 获取优惠券列表
 * @param {*} req 
 * @param {*} res 
 */
coupon.getCoupon = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let sql = "SELECT * FROM coupon WHERE state=1";
    let sql_result = await mysql.query(sql, []);
    res.send(base.result_ok('ok', sql_result))
};


/**
 * 添加优惠券
 * @param {*} req 
 * @param {*} res 
 */
coupon.add = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let name = req.body.name;
    if (!name) {
        res.send(base.result_error("优惠券名称不能为空"));
        return;
    }

    let description = req.body.description;
    if (!description) {
        res.send(base.result_error("使用详情不能为空"));
        return;
    }

    let value = parseInt(req.body.value);
    if (!(value > 0)) {
        res.send(base.result_error("优惠券金额不合法"));
        return;
    }

    let threshold = parseInt(req.body.threshold);
    if (!(threshold > 0)) {
        threshold = 0;
    }

    let valid_day = parseInt(req.body.valid_day);
    if (!(valid_day > 0)) {
        valid_day = 0;
    }

    let sql = `INSERT INTO coupon (name,description,value,threshold,valid_day) VALUES (?,?,?,?,?)`;
    let sql_params = [name, description, value, threshold, valid_day];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.insertId > 0) {
        res.send(base.result_ok("添加成功", sql_result.insertId));
        return;
    } else {
        res.send(base.result_error("添加失败"));
        return;
    }
};

/**
 * 更新优惠券
 * @param {*} req 
 * @param {*} res 
 */
coupon.update = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let id = parseInt(req.body.id);
    if (!(id > 0)) {
        res.send(base.result_error("优惠券id错误"));
        return;
    }
    let name = req.body.name;
    if (!name) {
        res.send(base.result_error("优惠券名称不能为空"));
        return;
    }

    let description = req.body.description;
    if (!description) {
        res.send(base.result_error("使用详情不能为空"));
        return;
    }

    let value = parseInt(req.body.value);
    if (!(value > 0)) {
        res.send(base.result_error("优惠券金额不合法"));
        return;
    }

    let threshold = parseInt(req.body.threshold);
    if (!(threshold > 0)) {
        threshold = 0;
    }

    let valid_day = parseInt(req.body.valid_day);
    if (!(valid_day > 0)) {
        valid_day = 0;
    }

    let sql = `UPDATE coupon SET name=?,description=?,value=?,threshold=?,valid_day=? WHERE id=?`;
    let sql_params = [name, description, value, threshold, valid_day, id];
    let sql_result = await mysql.query(sql, sql_params);
    res.send(base.result_ok("更新成功"));
    return;
};

/**
 * 删除优惠券
 * @param {*} req 
 * @param {*} res 
 */
coupon.delete = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let id = parseInt(req.body.id);
    if (!(id > 0)) {
        res.send(base.result_error("优惠券id错误"));
        return;
    }

    let sql = `UPDATE coupon SET state=-1 WHERE id=?`;
    let sql_params = [id];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.affectedRows > 0) {
        res.send(base.result_ok("删除成功"));
        return;
    } else {
        res.send(base.result_warning("删除异常"));
        return;
    }
}


/**
 * 获取用户优惠券列表【2】
 * @param {*} req 
 * @param {*} res 
 */
coupon.getUserCoupon = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let uid = parseInt(req.body.uid);
    if (!(uid > 0)) {
        res.send(base.result_error("用户id错误"));
        return;
    }

    let sql = `SELECT a.*,b.name,b.description,b.value,b.threshold,b.valid_day FROM user_coupon a 
    INNER JOIN coupon b ON a.cid=b.id 
    WHERE a.uid=? ORDER BY a.state DESC,a.update_time DESC `;
    let sql_result = await mysql.query(sql, [uid]);
    res.send(base.result_ok("ok", sql_result));
    return;
};

/**
 * 发放优惠券【2】
 * @param {*} req 
 * @param {*} res 
 */
coupon.setUserCoupon = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let uids = req.body.uids;
    if (!Array.isArray(uids) || uids.length == 0) {
        res.send(base.result_error("用户ids错误"));
        return;
    }

    let coupon_id = parseInt(req.body.coupon_id);
    if (!(coupon_id > 0)) {
        res.send(base.result_error("优惠券id错误"));
        return;
    }

    let sql = `SELECT * FROM coupon WHERE id=?`;
    let sql_result = await mysql.query(sql, [coupon_id]);
    if (sql_result.length == 0) {
        res.send(base.result_error("没有找到优惠券信息"));
        return;
    }

    let data = sql_result[0];
    let exTime = null;
    if (data.valid_day <= 0) {
        exTime = moment('2099-12-31 23:59:59').format('YYYY-MM-DD HH:mm:ss');
    } else {
        exTime = moment().add(data.valid_day, 'day').format('YYYY-MM-DD HH:mm:ss');
    }

    sql = "INSERT INTO user_coupon (uid,cid,state,time_valid) VALUES "
    let sql_params = [];
    uids.forEach(uid => {
        sql += "(?,?,1,?),"
        sql_params.push(uid, coupon_id, exTime);
    });
    sql = sql.substring(0, sql.length - 1);

    await mysql.query(sql, sql_params);

    res.send(base.result_ok("发放成功"));
    return;
};

module.exports = coupon;