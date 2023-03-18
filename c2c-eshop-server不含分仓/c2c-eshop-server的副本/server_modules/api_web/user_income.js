let user_income = {};
let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');


/**
 * 获取总收益统计信息
 * @param {*} req 
 * @param {*} res 
 */
user_income.getIncomeInfo = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let sql = "SELECT * FROM user_income WHERE uid=? ";
    let sql_result = await mysql.query(sql, [user_info.uid]);
    if (sql_result.length == 0) {
        sql = "INSERT INTO user_income (uid) VALUES (?) ";
        await mysql.query(sql, [user_info.uid]);
        sql = "SELECT * FROM user_income WHERE uid=? ";
        sql_result = await mysql.query(sql, [user_info.uid]);
    }
    let data = sql_result[0];

    let days7list = await mysql.query("SELECT SUM(income) income FROM user_income_record WHERE uid=? AND DATE_SUB (CURDATE(), INTERVAL 7 DAY) <= DATE(create_time)", [user_info.uid]);
    let todaylist = await mysql.query("SELECT SUM(income) income FROM user_income_record WHERE uid=? AND TO_DAYS(create_time) = TO_DAYS(NOW())", [user_info.uid]);

    data.today = todaylist[0].income == null ? 0 : todaylist[0].income;
    data.days7 = days7list[0].income == null ? 0 : days7list[0].income;

    res.send(base.result_ok("ok", data));
    return;
};

/**
 * 获取佣金（已到账）
 * @param {*} req 
 * @param {*} res 
 */
user_income.getIncomeRecord = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
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

    let sql = `SELECT a.*,b.avatar fans_avatar,b.nickname fans_nickname 
    FROM user_income_record a 
    LEFT JOIN user b ON a.fans_uid=b.uid 
    WHERE a.uid=? 
    ORDER BY a.create_time DESC 
    LIMIT ?,?`;
    // let sql_count = "SELECT COUNT(*) total_count FROM user_withdrawal WHERE uid=? ";
    let sql_count = "SELECT COUNT(*) total_count FROM user_income_record WHERE uid=? ";
    let sql_result = await mysql.query(sql, [user_info.uid, limit, page_size]);
    let sql_count_result = await mysql.query(sql_count, [user_info.uid]);

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }

    res.send(base.result_ok("ok", data));
};

/**
 * 获取佣金(未到账)
 * @param {*} req 
 * @param {*} res 
 */
user_income.getIncomeRecordNotSure = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
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

    let sql = `SELECT a.*,b.avatar fans_avatar,b.nickname fans_nickname,b.level1_recommender,b.level2_recommender  
    FROM user_order a 
    INNER JOIN user b ON a.uid=b.uid 
    WHERE (b.level1_recommender=? OR b.level2_recommender=?) AND a.state=1 AND a.pay_state=0   
    ORDER BY a.create_time DESC 
    LIMIT ?,?`;
    let sql_count = `SELECT COUNT(*) total_count  
    FROM user_order a 
    INNER JOIN user b ON a.uid=b.uid 
    WHERE (b.level1_recommender=? OR b.level2_recommender=?) AND a.state=1 AND a.pay_state=0`;
    let sql_result = await mysql.query(sql, [user_info.uid, user_info.uid, limit, page_size]);
    let sql_count_result = await mysql.query(sql_count, [user_info.uid, user_info.uid]);

    // 获取收益率
    let rates = await mysql.query("SELECT * FROM other_config WHERE id IN (2,3)");
    let r1 = 0;
    let r2 = 0;
    rates.forEach(item => {
        if (item.id == 2) {
            r1 = Number(item.value3);
        } else if (item.id == 3) {
            r2 = Number(item.value3);
        }
    });

    let total_income = 0;
    sql_result = sql_result.map(item => {
        if (item.level1_recommender == user_info.uid) {
            item.income = item.g_price * r1 * 0.001;
        } else if (item.level2_recommender == user_info.uid) {
            item.income = item.g_price * r2 * 0.001;
        }
        total_income += item.income;
        return item;
    })

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result,
        total_income: total_income
    }

    res.send(base.result_ok("ok", data));
};


/**
 * 申请提现
 * @param {*} req 
 * @param {*} res 
 */
user_income.withDrawal = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let amount = parseInt(req.body.amount);

    if (!(amount > 0)) {
        res.send(base.result_error("提现金额不合法"));
        return;
    }

    let sql = "SELECT * FROM user_income WHERE uid=? ";
    let sql_result = await mysql.query(sql, [user_info.uid]);
    if (sql_result.length == 0) {
        sql = "INSERT INTO user_income (uid) VALUES (?) ";
        await mysql.query(sql, [user_info.uid]);
        res.send(base.result_error("没有可提现的余额"));
        return;
    } else {
        let data = sql_result[0];
        if (data.income < amount) {
            res.send(base.result_error("可提现余额不足"));
            return;
        }
        await mysql.query("UPDATE user_income SET income=income-? WHERE uid=?", [amount, user_info.uid]);
        await mysql.query("INSERT INTO user_withdrawal (uid,before_total_income,before_availble_income,amount) VALUE (?,?,?,?)", [user_info.uid, data.income_total, data.income, amount]);
        res.send(base.result_ok("申请成功"));
        return;
    }
};


/**
 * 获取提现记录
 * @param {*} req 
 * @param {*} res 
 */
user_income.getWithdrawalRecord = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
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

    let sql = "SELECT * FROM user_withdrawal WHERE uid=? ORDER BY verify_time DESC LIMIT ?,?";
    let sql_count = "SELECT COUNT(*) total_count FROM user_withdrawal WHERE uid=? ";
    let sql_result = await mysql.query(sql, [user_info.uid, limit, page_size]);
    let sql_count_result = await mysql.query(sql_count, [user_info.uid]);

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }

    res.send(base.result_ok("ok", data));
};

/**
 * 获取收益信息（订单差价）
 * @param {*} req 
 * @param {*} res 
 */
user_income.getOrderSaleIncomeInfo = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let data = {
        total: 0,
        today: 0
    };

    let todaylist = await mysql.query("SELECT SUM((newprice-oldprice)-payprice) today FROM user_order_publish WHERE uid=? AND hassale=1 AND pay_state=1 AND TO_DAYS(update_time) = TO_DAYS(NOW())", [user_info.uid]);
    let totallist = await mysql.query("SELECT SUM((newprice-oldprice)-payprice) total FROM user_order_publish WHERE uid=? AND hassale=1 AND pay_state=1 ", [user_info.uid]);

    data.today = todaylist[0].today == null ? 0 : todaylist[0].today;
    data.total = totallist[0].total == null ? 0 : totallist[0].total;
    res.send(base.result_ok("ok", data));
};


/**
 * 获取收益列表（订单差价）
 * @param {*} req 
 * @param {*} res 
 */
user_income.getOrderSaleIncome = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
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

    let sql = `SELECT a.*,b.name,b.img,c.order_no  
    FROM user_order_publish a 
    LEFT JOIN goods_rush b ON a.gid=b.gid 
    LEFT JOIN user_order c ON a.relate_order_id=c.order_id 
    WHERE a.uid=? AND a.pay_state=1 AND a.hassale=1  
    LIMIT ?,?`;
    let sql_count = "SELECT COUNT(*) total_count FROM user_order_publish WHERE uid=? AND pay_state=1 AND hassale=1";
    let sql_result = await mysql.query(sql, [user_info.uid, limit, page_size]);
    let sql_count_result = await mysql.query(sql_count, [user_info.uid]);

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }

    res.send(base.result_ok("ok", data));
};

module.exports = user_income;