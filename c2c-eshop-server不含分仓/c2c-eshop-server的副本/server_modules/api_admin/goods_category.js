let goods_category = {};

let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
let KEYS = require('../redis_key');
let redis = require('../redis');

let default_data = {
    categoty_img: ""
}

/**
 * 获取商品分类
 * @param {*} req 
 * @param {*} res 
 */
goods_category.getCategory = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let sql = "SELECT * FROM goods_category";
    let sql_result = await mysql.query(sql, []);
    res.send(base.result_ok('ok', sql_result))
};

/**
 * 添加分类
 * @param {*} req 
 * @param {*} res 
 */
goods_category.add = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let name = req.body.name;
    if (!name) {
        res.send(base.result_error("分类名称不能为空"));
        return;
    }
    let img = req.body.img;
    if (!img) {
        img = default_data.categoty_img;
    }

    let sql = `INSERT INTO goods_category (name,img) VALUES (?,?)`;
    let sql_params = [name, img];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.insertId > 0) {
        await goods_category.updateRedis();
        res.send(base.result_ok("添加成功", sql_result.insertId));
        return;
    } else {
        res.send(base.result_error("添加失败"));
        return;
    }
};

/**
 * 更新分类
 * @param {*} req 
 * @param {*} res 
 */
goods_category.update = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let cid = parseInt(req.body.cid);
    if (!(cid >= 0)) {
        res.send(base.result_error("分类id错误"));
        return;
    }

    let name = req.body.name;
    if (!name) {
        res.send(base.result_error("分类名称不能为空"));
        return;
    }
    let img = req.body.img;
    if (!img) {
        img = "";
    }
    let state = parseInt(req.body.state);
    if (state != 0 && state != 1) {
        res.send(base.result_error("显示状态参数错误"));
        return;
    }

    let sql = `UPDATE goods_category SET name=?,img=?,state=? WHERE cid=?`;
    let sql_params = [name, img, state, cid];
    let sql_result = await mysql.query(sql, sql_params);
    await goods_category.updateRedis();
    res.send(base.result_ok("更新成功"));
    return;
};

/**
 * 删除分类
 * @param {*} req 
 * @param {*} res 
 */
goods_category.delete = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let cid = parseInt(req.body.cid);
    if (cid == 0) {
        res.send(base.result_error("总分类不能删除，请选择隐藏"));
        return;
    }
    if (!(cid > 0)) {
        res.send(base.result_error("分类id错误"));
        return;
    }

    let sql = `DELETE FROM goods_category WHERE cid=?`;
    let sql_params = [cid];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.affectedRows > 0) {
        await goods_category.updateRedis();
        res.send(base.result_ok("删除成功"));
        return;
    } else {
        res.send(base.result_warning("删除异常"));
        return;
    }
}


// ---- private ----
/**
 * 更新商品分类到Redis
 * @param {*} data 
 */
goods_category.updateRedis = async () => {
    let data = await mysql.query("SELECT * FROM goods_category", []);
    await redis.Client3.set(KEYS.CATEGORY_LIST, JSON.stringify(data));
};

module.exports = goods_category;