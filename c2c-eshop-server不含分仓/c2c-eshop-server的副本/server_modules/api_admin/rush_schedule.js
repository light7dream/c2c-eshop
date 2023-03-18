let rush_schedule = {};

let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
let KEYS = require('../redis_key');
let redis = require('../redis');

/**
 * 获取抢购场次列表
 * @param {*} req 
 * @param {*} res 
 */
rush_schedule.getList = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let sql = "SELECT a.*,b.bucket_name FROM rush_schedule a LEFT JOIN user_bucket b ON a.bucket_id=b.uid ORDER BY starttime ASC";
    let sql_result = await mysql.query(sql, []);
    res.send(base.result_ok('ok', sql_result))
};


/**
 * 添加抢购场次
 * @param {*} req 
 * @param {*} res 
 */
rush_schedule.add = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let name = req.body.name;
    if (!name) {
        name = "";
    }

    let starttime = req.body.starttime;
    if (!starttime) {
        res.send(base.result_error("开始时间不能为空"));
        return;
    }

    let endtime = req.body.endtime;
    if (!endtime) {
        res.send(base.result_error("结束时间不能为空"));
        return;
    }
    let bucket_id = parseInt(req.body.bucket_id)||0;

    let sql = `INSERT INTO rush_schedule (name,starttime,endtime,bucket_id) VALUES (?,?,?,?)`;
    let sql_params = [name, starttime, endtime, bucket_id];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.insertId > 0) {
        await rush_schedule.updateRedis();
        res.send(base.result_ok("添加成功", sql_result.insertId));
        return;
    } else {
        res.send(base.result_error("添加失败"));
        return;
    }
};

/**
 * 更新抢购场次
 * @param {*} req 
 * @param {*} res 
 */
rush_schedule.update = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let id = parseInt(req.body.id);
    if (!(id > 0)) {
        res.send(base.result_error("抢购场次id错误"));
        return;
    }

    let name = req.body.name;
    if (!name) {
        name = "";
    }

    let starttime = req.body.starttime;
    if (!starttime) {
        res.send(base.result_error("开始时间不能为空"));
        return;
    }

    let endtime = req.body.endtime;
    if (!endtime) {
        res.send(base.result_error("结束时间不能为空"));
        return;
    }

    let state = parseInt(req.body.state);
    if (state != 0 && state != 1) {
        res.send(base.result_error("状态错误"));
        return;
    }

    let tip = req.body.tip;
    if (tip == null) {
        tip = '';
    }

    let bucket_id = parseInt(req.body.bucket_id)||0;

    let sql = `UPDATE rush_schedule SET name=?,starttime=?,endtime=?,state=?,tip=?,bucket_id=? WHERE id=?`;
    let sql_params = [name, starttime, endtime, state, tip, bucket_id, id];
    let sql_result = await mysql.query(sql, sql_params);
    await rush_schedule.updateRedis();
    base.logAdmin(user_info.uid, '更新抢购场次', `id:${id};name:${name};starttime:${starttime};endtime:${endtime};state:${state};tip:${tip}`);
    res.send(base.result_ok("更新成功"));
    return;
};

/**
 * 删除抢购场次
 * @param {*} req 
 * @param {*} res 
 */
rush_schedule.delete = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let id = parseInt(req.body.id);
    if (!(id > 0)) {
        res.send(base.result_error("抢购场次id错误"));
        return;
    }

    let sql = `DELETE FROM rush_schedule WHERE id=?`;
    let sql_params = [id];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.affectedRows > 0) {
        await rush_schedule.updateRedis();
        base.logAdmin(user_info.uid, '删除抢购场次', `id:${id}`);
        res.send(base.result_ok("删除成功"));
        return;
    } else {
        res.send(base.result_warning("删除异常"));
        return;
    }
}

// ---- private ----
/**
 * 更新抢购场次到Redis
 * @param {*} data 
 */
rush_schedule.updateRedis = async () => {
    let data = await mysql.query("SELECT *,state schedule_state FROM rush_schedule ORDER BY starttime ASC", []);
    await redis.Client0.set(KEYS.RUSH_SCHEDULE, JSON.stringify(data));
};

module.exports = rush_schedule;