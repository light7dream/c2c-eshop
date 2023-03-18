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
coupon.getCouponList = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let sql = `SELECT a.*,b.name,b.description,b.value,b.threshold,b.valid_day FROM user_coupon a 
    INNER JOIN coupon b ON a.cid=b.id 
    WHERE a.uid=? AND a.state>0 AND NOW()<a.time_valid 
    ORDER BY a.state DESC,a.update_time DESC `;
    let sql_result = await mysql.query(sql, [user_info.uid]);
    res.send(base.result_ok("ok", sql_result));
    return;
};

module.exports = coupon;