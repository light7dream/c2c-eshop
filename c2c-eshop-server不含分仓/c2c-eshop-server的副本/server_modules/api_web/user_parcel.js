let user_parcel = {};
let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');


/**
 * 获取快递列表
 * @param {*} req 
 * @param {*} res 
 */
user_parcel.getList = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let sql = "SELECT * FROM user_parcel WHERE uid=? AND state<>-1 ORDER BY update_time DESC ";
    let sql_result = await mysql.query(sql, [user_info.uid]);
    res.send(base.result_ok("ok", sql_result));
    return;
};

/**
 * 请求发货
 * @param {*} req 
 * @param {*} res 
 */
user_parcel.needParcel = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let order_id = parseInt(req.body.order_id);
    if (!(order_id > 0)) {
        res.send(base.result_error("订单id错误"));
        return;
    }

    let parcel = "";
    let parcel_state = 0;

    let sql = `INSERT INTO user_parcel (uid,order_id,parcel,parcel_state) VALUES (?,?,?,?)`;
    let sql_result = await mysql.query(sql, [user_info.uid, order_id, parcel, parcel_state]);
    res.send(base.result_ok("申请成功"));
    return;
};

/**
 * 确认收货
 * @param {*} req 
 * @param {*} res 
 */
user_parcel.ack = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let id = parseInt(req.body.id);
    if (!(id > 0)) {
        res.send(base.result_error("确认收货失败"));
        return;
    }

    let sql = `UPDATE user_parcel SET parcel_state=1 WHERE id=? AND uid=?`;
    let sql_result = await mysql.query(sql, [id, user_info.uid]);
    res.send(base.result_ok("ok"));
    return;
};

/**
 * 删除收货信息
 * @param {*} req 
 * @param {*} res 
 */
user_parcel.delete = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let id = parseInt(req.body.id);
    if (!(id > 0)) {
        res.send(base.result_error("收货信息错误"));
        return;
    }

    let sql = `UPDATE user_parcel SET state=-1 WHERE id=? AND uid=?`;
    let sql_result = await mysql.query(sql, [id, user_info.uid]);
    res.send(base.result_ok("删除成功"));
    return;
};

module.exports = user_parcel;