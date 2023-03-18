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
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let state = parseInt(req.body.state);
    let parcel_state = parseInt(req.body.parcel_state);
    let page_size = parseInt(req.body.page_size);
    let page_index = parseInt(req.body.page_index);
    if (!(page_size > 0) || !(page_index >= 0)) {
        res.send(base.result_error("分页参数错误", { page_index, page_size }));
        return;
    }
    let limit = page_index * page_size;

    let sql = "SELECT * FROM user_parcel WHERE id>0 ";
    let sql_count = "SELECT COUNT(*) total_count FROM user_parcel WHERE id>0 ";
    let sql_param = [];
    if (state > -2 || state < 2) {
        sql += " AND state=? ";
        sql_count += " AND state=? ";
        sql_param.push(state);
    }
    if (parcel_state > -1 && parcel_state < 4) {
        sql += " AND parcel_state=? ";
        sql_count += " AND parcel_state=? ";
        sql_param.push(parcel_state);
    }
    sql += " ORDER BY update_time DESC LIMIT ?,?";
    sql_count += " ORDER BY update_time DESC ";
    sql_param.push(limit);
    sql_param.push(page_size);

    let sql_result = await mysql.query(sql, sql_param);
    let sql_count_result = await mysql.query(sql_count, sql_param);

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }

    res.send(base.result_ok("ok", data));
};

/**
 * 更新快递状态
 * @param {*} req 
 * @param {*} res 
 */
user_parcel.update = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let id = parseInt(req.body.id);
    if (!(id > 0)) {
        res.send(base.result_error("参数错误"));
        return;
    }

    let parcel = req.body.parcel;
    let parcel_state = parseInt(req.body.parcel_state);
    let state = parseInt(req.body.state);

    if (!(parcel_state > -1 && parcel_state < 4)) {
        res.send(base.result_error("快递状态不能为空"));
        return;
    }
    if (state != -1 && state != 1) {
        res.send(base.result_error("删除状态不合法"));
        return;
    }
    if (!parcel) {
        res.send(base.result_error("快递信息不能为空"));
        return;
    }

    let sql = `UPDATE user_parcel SET parcel=?,parcel_state=?,state=? WHERE id=?`;
    let sql_result = await mysql.query(sql, [parcel, parcel_state, state, id]);
    res.send(base.result_ok("ok"));
    return;
};

module.exports = user_parcel;