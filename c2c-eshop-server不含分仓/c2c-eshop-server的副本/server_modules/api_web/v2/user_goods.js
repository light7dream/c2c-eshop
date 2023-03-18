let user_goods = {};
let base = require('../../base');
let mysql = require('../../mysql');
let moment = require('moment');
let KEYS = require('../../redis_key');


/**
 * V2:我是买方（商品列表）
 * @param {*} req 
 * @param {*} res 
 */
 user_goods.imBuyer = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let sql = `SELECT a.*,b.order_id,b.order_id,b.order_no,c.payee_name,c.payee_bankname,c.payee_bankno,c.avatar belong_avatar,c.nickname belong_nickname,c.wxpay_img,c.alipay_img,
    d.avatar rusher_avatar,d.nickname rusher_nickname,e.avatar last_belong_avatar,e.nickname last_belong_nickname,f.name schedule_name  
    FROM goods_rush a 
    LEFT JOIN user_order b ON a.current_order_id=b.order_id 
    LEFT JOIN user c ON c.uid=a.belong  
    LEFT JOIN user d ON d.uid=a.rusher_id   
    LEFT JOIN user e ON e.uid=a.last_belong   
    LEFT JOIN rush_schedule f ON f.id=a.sid 
    WHERE (a.belong=? AND a.state IN (0,1,6)) OR (a.rusher_id=? AND a.state IN (2,3,5)) 
    ORDER BY b.create_time DESC`;

    let sql_result = await mysql.query(sql, [user_info.uid, user_info.uid]);

    res.send(base.result_ok("ok", sql_result));
};

/**
 * V2:我是卖方（商品列表）
 * @param {*} req 
 * @param {*} res 
 */
 user_goods.imSaler = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let sql = `SELECT a.*,b.order_id,b.order_no,c.name schedule_name 
    FROM goods_rush a 
    LEFT JOIN user_order b ON a.current_order_id=b.order_id 
    LEFT JOIN rush_schedule c ON c.id=a.sid 
    WHERE (a.belong=? AND a.state IN (1,2,3,5,6))`;
    let sql_result = await mysql.query(sql, [user_info.uid]);

    res.send(base.result_ok("ok", sql_result));
};

module.exports = user_goods;