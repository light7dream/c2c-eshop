let public_notice = {};

let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
let KEYS = require('../redis_key');
let redis = require('../redis');

/**
 * 获取公告
 * @param {*} req 
 * @param {*} res 
 */
public_notice.getNotice = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let sql = "SELECT * FROM public_notice WHERE state<>-1 ORDER BY no,nid ASC";
    let sql_result = await mysql.query(sql, []);
    res.send(base.result_ok('ok', sql_result))
};


/**
 * 添加公告
 * @param {*} req 
 * @param {*} res 
 */
public_notice.add = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let summary = req.body.summary;
    if (!summary) {
        res.send(base.result_error("公告摘要不能为空"));
        return;
    }

    let notice = req.body.notice;
    if (!notice) {
        res.send(base.result_error("公告内容不能为空"));
        return;
    }

    let state = parseInt(req.body.state);
    if (state != 0 && state != 1) {
        res.send(base.result_error("需要设置公告显示状态"));
        return;
    }

    let no = parseInt(req.body.no);
    if (!(no > 0)) {
        no = 0;
    }

    let sql = `INSERT INTO public_notice (summary,notice,no,state) VALUES (?,?,?,?)`;
    let sql_params = [summary, notice, no, state];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.insertId > 0) {
        await public_notice.updateRedis();
        res.send(base.result_ok("添加成功", sql_result.insertId));
        return;
    } else {
        res.send(base.result_error("添加失败"));
        return;
    }
};

/**
 * 更新公告
 * @param {*} req 
 * @param {*} res 
 */
public_notice.update = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let nid = parseInt(req.body.nid);
    if (!(nid > 0)) {
        res.send(base.result_error("公告id错误"));
        return;
    }

    let summary = req.body.summary;
    if (!summary) {
        res.send(base.result_error("公告摘要不能为空"));
        return;
    }

    let notice = req.body.notice;
    if (!notice) {
        res.send(base.result_error("公告内容不能为空"));
        return;
    }

    let state = parseInt(req.body.state);
    if (state != 0 && state != 1) {
        res.send(base.result_error("需要设置公告显示状态"));
        return;
    }

    let no = parseInt(req.body.no);
    if (!(no >= 0)) {
        res.send(base.result_error("公告顺序需要设置"));
        return;
    }

    let sql = `UPDATE public_notice SET summary=?,notice=?,no=?,state=? WHERE nid=?`;
    let sql_params = [summary, notice, no, state, nid];
    let sql_result = await mysql.query(sql, sql_params);
    await public_notice.updateRedis();
    res.send(base.result_ok("更新成功"));
    return;
};

/**
 * 更新公告显示顺序
 * @param {*} req 
 * @param {*} res 
 */
public_notice.updateOrder = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let oldList = req.body.oldList;
    let newList = req.body.newList;
    console.log(oldList, newList);

    if (!Array.isArray(oldList) || !Array.isArray(newList)) {
        res.send(base.result_error("参数错误"));
        return;
    }

    if (oldList.length != newList.length) {
        res.send(base.result_error("参数不一致"));
        return;
    }

    if (oldList.length == 0) {
        res.send(base.result_ok("不需要更新"));
        return;
    }

    let sql = `UPDATE public_notice SET no= CASE nid `;
    let sql_param = [];

    for (let i = 0; i < oldList.length; i++) {
        sql += " WHEN ? THEN ? ";
        sql_param.push(newList[i]);
        sql_param.push(i);
    }

    sql += " END WHERE nid IN (?)";
    sql_param.push(oldList);

    let sql_result = await mysql.query(sql, sql_param);

    sql = "SELECT * FROM public_notice WHERE state<>-1 ORDER BY no ASC,nid ASC";
    sql_result = await mysql.query(sql, []);

    await public_notice.updateRedis();
    res.send(base.result_ok("更新成功", sql_result));
    return;
};

/**
 * 删除公告
 * @param {*} req 
 * @param {*} res 
 */
public_notice.delete = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let nid = parseInt(req.body.nid);
    if (!(nid > 0)) {
        res.send(base.result_error("公告id错误"));
        return;
    }

    let sql = `UPDATE public_notice SET state=-1 WHERE nid=?`;
    let sql_params = [nid];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.affectedRows > 0) {
        await public_notice.updateRedis();
        res.send(base.result_ok("删除成功"));
        return;
    } else {
        res.send(base.result_warning("删除异常"));
        return;
    }
}
// ---- private ----

/**
 * 更新公告到Redis
 * @param {*} data 
 */
public_notice.updateRedis = async () => {
    let data = await mysql.query("SELECT * FROM public_notice WHERE state<>-1 ORDER BY no,nid ASC", []);
    await redis.Client3.set(KEYS.NOTICE_LIST, JSON.stringify(data));
};
module.exports = public_notice;