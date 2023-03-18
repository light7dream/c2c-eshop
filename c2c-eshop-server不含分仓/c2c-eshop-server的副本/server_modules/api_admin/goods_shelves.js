let goods_shelves = {};

let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
let KEYS = require('../redis_key');
let redis = require('../redis');
const XLSX = require('xlsx')
const path = require('path')

/**
 * 获取货架商品
 * @param {*} req 
 * @param {*} res 
 */
goods_shelves.getGoods = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let page_size = parseInt(req.body.page_size);
    let page_index = parseInt(req.body.page_index);
    if (!(page_size > 0) || !(page_index >= 0)) {
        res.send(base.result_error("分页参数错误", { page_index, page_size }));
        return;
    }
    let limit = page_index * page_size;

    let cid = parseInt(req.body.cid);
    let name = req.body.name;
    let state = parseInt(req.body.state);

    let sql = "SELECT * FROM goods_shelves WHERE gid<>0 ";
    let sql_count = "SELECT COUNT(*) total_count FROM goods_shelves WHERE gid<>0 ";
    let sql_params = [];

    if (cid > 0) {
        sql += " AND cid=? ";
        sql_count += " AND cid=? ";
        sql_params.push(cid);
    }
    if (name) {
        sql += " AND (name LIKE ? OR summary LIKE ? OR description LIKE ?)  ";
        sql_count += " AND (name LIKE ? OR summary LIKE ? OR description LIKE ?)  ";
        sql_params.push(`%${name}%`);
        sql_params.push(`%${name}%`);
        sql_params.push(`%${name}%`);
    }
    if (state > -1) {
        sql += " AND state=? ";
        sql_count += " AND state=? ";
        sql_params.push(state);
    } else {
        sql += " AND state<>-1 ";
        sql_count += " AND state<>-1 ";
    }
    sql += " ORDER BY gid DESC LIMIT ?,?";
    sql_params.push(limit);
    sql_params.push(page_size);

    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }

    res.send(base.result_ok("ok", data));
};

/**
 * 导出货架商品
 * @param {*} req 
 * @param {*} res 
 */
 goods_shelves.exportGoods = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    // let page_size = parseInt(req.body.page_size);
    // let page_index = parseInt(req.body.page_index);
    // if (!(page_size > 0) || !(page_index >= 0)) {
    //     res.send(base.result_error("分页参数错误", { page_index, page_size }));
    //     return;
    // }
    // let limit = page_index * page_size;
    const workbook = [['商品id', '商品编号', '商品名称', '商品类别','价格','商品简介','数量','状态']]
    let cid = parseInt(req.body.cid);
    let name = req.body.name;
    let state = parseInt(req.body.state);

    let sql = "SELECT * FROM goods_shelves WHERE gid<>0 ";
    let sql_count = "SELECT COUNT(*) total_count FROM goods_shelves WHERE gid<>0 ";
    let sql_params = [];

    if (cid > 0) {
        sql += " AND cid=? ";
        sql_count += " AND cid=? ";
        sql_params.push(cid);
    }
    if (name) {
        sql += " AND (name LIKE ? OR summary LIKE ? OR description LIKE ?)  ";
        sql_count += " AND (name LIKE ? OR summary LIKE ? OR description LIKE ?)  ";
        sql_params.push(`%${name}%`);
        sql_params.push(`%${name}%`);
        sql_params.push(`%${name}%`);
    }
    if (state > -1) {
        sql += " AND state=? ";
        sql_count += " AND state=? ";
        sql_params.push(state);
    } else {
        sql += " AND state<>-1 ";
        sql_count += " AND state<>-1 ";
    }
    sql += " ORDER BY gid DESC";
    // sql_params.push(limit);
    // sql_params.push(page_size);

    let sql_result = await mysql.query(sql, sql_params);
    const goodsCategory = await mysql.query("SELECT * FROM goods_category WHERE cid<>0");
    // let sql_count_result = await mysql.query(sql_count, sql_params);
    for(let good of sql_result){
        let cate
        if(good.cid){
            cate = goodsCategory.find(item => item.cid === good.cid);
        }
        let state = '正常'
        if(good.state === -1){
            state = '已删除'
        } else if(good.state === 0){
            state = '未放置货架'
        } else if(good.state === 2){
            state = '已下架'
        }
        workbook.push([good.gid||'',good.code||'',good.name||'',(cate&&cate.name)||'',good.price||'',good.summary||'',good.count||0,state])
    }
    const filename = `货架商品列表_${new Date()
        .toJSON()
        .slice(0, 10)}_${Date.now()}.xlsx`
    const targetPath = path.resolve(path.join(__dirname,`../../xlsx/${filename}`))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(workbook)
    XLSX.utils.book_append_sheet(wb, ws)
    XLSX.writeFile(wb, `${targetPath}`, {
    compression: true,
    })

    res.send(base.result_ok('ok', `./xlsx/${filename}`))
};


/**
 * 添加货架商品
 * @param {*} req 
 * @param {*} res 
 */
goods_shelves.add = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let cid = parseInt(req.body.cid);
    if (!(cid >= 0)) {
        res.send(base.result_error("分类错误"));
        return;
    }

    let name = req.body.name;
    if (!name) {
        res.send(base.result_error("商品名称不能为空"));
        return;
    }

    let summary = req.body.summary;
    if (!summary) {
        summary = name;
    }

    let description = req.body.description;
    if (!description) {
        res.send(base.result_error("商品详情不能为空"));
        return;
    }

    let price = parseInt(req.body.price);
    if (!(price > 0)) {
        res.send(base.result_error("价格不合法"));
        return;
    }

    let count = parseInt(req.body.count);
    if (!(count > 0 && count < 10000)) {
        res.send(base.result_error("商品数量不合法 (1-9999)"));
        return;
    }

    let state = parseInt(req.body.state);
    if (!(state > -1)) {
        res.send(base.result_error("商品状态不合法"));
        return;
    }

    let img = req.body.img;
    if (!img) {
        res.send(base.result_error("请设置商品图片"));
        return;
    }


    let sql = `INSERT INTO goods_shelves (cid,name,summary,description,img,price,count,state) VALUES (?,?,?,?,?,?,?,?)`;
    let sql_params = [cid, name, summary, description, img, price, count, state];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.insertId > 0) {
        let data = await mysql.query("SELECT * FROM goods_shelves WHERE gid=?", [sql_result.insertId]);
        redis.addShelvesGoods(data[0]);
        res.send(base.result_ok("添加成功", sql_result.insertId));
        return;
    } else {
        res.send(base.result_error("添加失败"));
        return;
    }
};


/**
 * 更新货架商品
 * @param {*} req 
 * @param {*} res 
 */
goods_shelves.update = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("货架商品id错误"));
        return;
    }

    let cid = parseInt(req.body.cid);
    if (!(cid >= 0)) {
        res.send(base.result_error("分类错误"));
        return;
    }

    let name = req.body.name;
    if (!name) {
        res.send(base.result_error("商品名称不能为空"));
        return;
    }

    let summary = req.body.summary;
    if (!summary) {
        summary = "";
    }

    let description = req.body.description;
    if (!description) {
        res.send(base.result_error("商品详情不能为空"));
        return;
    }

    let price = parseInt(req.body.price);
    if (!(price > 0)) {
        res.send(base.result_error("价格不合法"));
        return;
    }

    let count = parseInt(req.body.count);
    if (!(count > 0 && count < 10000)) {
        res.send(base.result_error("商品数量不合法 (1-9999)"));
        return;
    }

    let state = parseInt(req.body.state);
    if (!(state > -1)) {
        res.send(base.result_error("商品状态不合法"));
        return;
    }

    let img = req.body.img;
    if (!img) {
        res.send(base.result_error("请设置商品图片"));
        return;
    }


    let sql = `UPDATE goods_shelves SET cid=?, name=?, summary=?, description=?, img=?, price=?, count=?, state=? WHERE gid=?`;
    let sql_params = [cid, name, summary, description, img, price, count, state, gid];
    let sql_result = await mysql.query(sql, sql_params);
    let data = await mysql.query("SELECT * FROM goods_shelves WHERE gid=?", [gid]);
    if (state == 1) {
        redis.addShelvesGoods(data[0]);
    } else {
        redis.removeShelvesGoods(data[0]);
    }
    res.send(base.result_ok("更新成功"));
    return;
};


/**
 * 删除货架商品
 * @param {*} req 
 * @param {*} res 
 */
goods_shelves.delete = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("货架商品id错误"));
        return;
    }

    let sql = `UPDATE goods_shelves SET state=-1 WHERE gid=?`;
    let sql_params = [gid];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.affectedRows > 0) {
        let data = await mysql.query("SELECT * FROM goods_shelves WHERE gid=?", [gid]);
        redis.removeShelvesGoods(data[0]);
        res.send(base.result_ok("删除成功"));
        return;
    } else {
        res.send(base.result_warning("删除异常"));
        return;
    }
}

module.exports = goods_shelves;