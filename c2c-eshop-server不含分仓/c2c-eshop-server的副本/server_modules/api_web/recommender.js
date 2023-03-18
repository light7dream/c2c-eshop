/**
 * 推荐相关
 */
let recommender = {};
let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');



// ---- private ----
/**
 * 获取所有等级的推荐人
 * @param {*} rid 推荐人id
 */
recommender.funcGetAllLevelRecommender = async (rid) => {
    let data = {
        path: '[]',
        level1: 0,
        level2: 0,
        bucket_id: 0
    };
    // try {
    //     rid = base.decrypt(rid);
    // } catch { }

    if (rid > 0) {
        let sql = `SELECT * FROM user WHERE uid=?`;
        let result = await mysql.query(sql, [rid]);

        if (result.length > 0) {
            let rpath = JSON.parse(result[0].recommender_path);
            rpath.push(rid);
            data.path = JSON.stringify(rpath);
            data.level1 = rid;
            data.level2 = result[0].level1_recommender;
            data.bucket_id = result[0].bucket_id;
        }
    }
    return data;
};

module.exports = recommender;