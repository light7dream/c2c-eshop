/**
 * 上帝模式
 */
let user_order = {}
// let package_json = require('../../package.json')
let base = require('../base')
let mysql = require('../mysql')
let redis = require('../redis');
let KEYS = require('../redis_key');
// let KEYS = require('../redis_key')
const { getRecursionUids, getRecommendLinks } = require('./utils')
const moment = require('moment')
const XLSX = require('xlsx')
const path = require('path')

/**
 * 获取订单
 * @param {*} req
 * @param {*} res
 */
user_order.getList = async (req, res) => {
  let token_info = await base.checkAdminToken(req)
  if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
    res.send(base.result_error('登录失败'))
    return
  }
  let user_info = token_info.data

  let page_size = parseInt(req.body.page_size)
  let page_index = parseInt(req.body.page_index)
  if (!(page_size > 0) || !(page_index >= 0)) {
    res.send(base.result_error('分页参数错误', { page_index, page_size }))
    return
  }
  let limit = page_index * page_size

  let salerPhone = req.body.salerPhone
  let buyerPhone = req.body.buyerPhone
  let state = parseInt(req.body.state)
  let payState = parseInt(req.body.payState)
  let goodName = req.body.goodName
  let topUid = req.body.topUid
  let createdAtStart = req.body.createdAtStart
  let createdAtEnd = req.body.createdAtEnd
  // 要查总经销
  let user_sql = `SELECT uid, nickname, level1_recommender, level2_recommender, roles FROM user WHERE state > -1`
  let users = await mysql.query(user_sql, [])

  let sql = `SELECT a.*, b.code as '商品code', b.name as '商品name', c.nickname as '买方nickname', c.phone as '买方phone', c.avatar as '买方avatar', d.nickname as '卖方nickname', d.phone as '卖方phone', d.avatar as '卖方avatar',c.payee_name as '买方payeename',c.payee_bankname as '买方bankname',c.payee_bankno as '买方bankno',c.wxpay_img as '买方wxpay_img',c.alipay_img as '买方alipay_img',d.payee_name as '卖方payeename',d.payee_bankname as '卖方bankname',d.payee_bankno as '卖方bankno',d.wxpay_img as '卖方wxpay_img',d.alipay_img as '卖方alipay_img' FROM user_order a 
    INNER JOIN goods_rush b ON a.gid=b.gid
    LEFT JOIN user c ON c.uid=a.uid
    LEFT JOIN user d ON d.uid=a.saler_id
    WHERE a.order_id<>0`
  let sql_count = `SELECT COUNT(DISTINCT a.order_id) AS 'total_count' FROM user_order a
    INNER JOIN goods_rush b ON a.gid = b.gid
    LEFT JOIN user c ON c.uid=a.uid
    WHERE a.order_id<>0`
  let sql_params = []

  if (state > -1) {
    sql += ' AND a.state=? '
    sql_count += ' AND a.state=? '
    sql_params.push(state)
  } else {
     if(payState == -1){
        sql += ' AND a.state=-1 '
        sql_count += ' AND a.state=-1 '
      }else{
        sql += ' AND a.state<>-1 '
        sql_count += ' AND a.state<>-1 '
      }
  }
  if (payState > -1) {
    sql += ' AND a.pay_state=? '
    sql_count += ' AND a.pay_state=? '
    sql_params.push(payState)
  } else {
    sql += ' AND a.pay_state<>-1 '
    sql_count += ' AND a.pay_state<>-1 '
  }

  if (createdAtStart) {
    const start = moment(createdAtStart).format('YYYY-MM-DD HH:mm:ss')
    sql += ` AND a.create_time >= '${start}' `
    sql_count += ` AND a.create_time >= '${start}' `
  }

  if (createdAtEnd) {
    const end = moment(createdAtEnd).format('YYYY-MM-DD HH:mm:ss')
    sql += ` AND a.create_time <= '${end}' `
    sql_count += ` AND a.create_time <= '${end}' `
  }

  if (salerPhone) {
    user_sql = `SELECT uid FROM user WHERE phone LIKE ?`
    let saleUsers = await mysql.query(user_sql, [`%${salerPhone}%`])
    if (saleUsers.length > 0) {
      sql += ` AND a.saler_id IN (${saleUsers.map((v) => v.uid).join(',')})`
      sql_count += ` AND a.saler_id IN (${saleUsers
        .map((v) => v.uid)
        .join(',')})`
    }
  }
  if (buyerPhone) {
    user_sql = `SELECT uid FROM user WHERE phone LIKE ?`
    let buyUsers = await mysql.query(user_sql, [`%${buyerPhone}%`])
    if (buyUsers.length > 0) {
      sql += ` AND a.uid IN (${buyUsers.map((v) => v.uid).join(',')})`
      sql_count += ` AND a.uid IN (${buyUsers.map((v) => v.uid).join(',')})`
    }
  }

  if (topUid) {
    let uids = [topUid]
    // 递归获取当前用户相关的所有粉丝和二级粉丝
    getRecursionUids(uids, users)
    if (uids.length > 0) {
      sql += ` AND a.uid IN (${uids.join(',')})`
      sql_count += ` AND a.uid IN (${uids.join(',')})`
    }
  }

  // 商品名称
  if (goodName) {
    user_sql = `SELECT gid FROM goods_rush WHERE name LIKE ?`
    let filterGoods = await mysql.query(user_sql, [`%${goodName}%`])
    if (filterGoods.length > 0) {
      sql += ` AND a.gid IN (${filterGoods.map((v) => v.gid).join(',')})`
      sql_count += ` AND a.gid IN (${filterGoods.map((v) => v.gid).join(',')})`
    }
  }

  sql += ' ORDER BY a.create_time DESC,a.state DESC,a.order_id ASC LIMIT ?,?'
  sql_params.push(limit)
  sql_params.push(page_size)

  let sql_result = await mysql.query(sql, sql_params)
  let sql_count_result = await mysql.query(sql_count, sql_params)
  let topUserStatics = {}
  sql_result.forEach((result) => {
    let topUser
    if (result && result.uid) {
      const curUser = users.find((v) => v.uid === result.uid)
      const roles = (curUser&&curUser.roles && JSON.parse(curUser.roles)) || []
      // 只有非管理员有总销
      if (!roles.includes(1)) {
        // 先从统计数据中取值
        topUser = topUserStatics[result.uid]
        if (!topUser) {
          const curLinks = [result.uid]
          getRecommendLinks(curLinks, users)
          const curTopUser =
            users.find((user) => user.uid === curLinks[curLinks.length - 1]) ||
            {}
          // 避免重复计算，将数据缓存至统计数据中
          topUserStatics[result.uid] = curTopUser
          topUser = curTopUser
        }
      }
    }
    result.总销 = topUser || {}
  })

  let data = {
    page_index,
    page_size,
    total_count: sql_count_result[0].total_count,
    list: sql_result,
  }

  res.send(base.result_ok('ok', data))
}

/**
 * 获取并导出订单
 * @param {*} req
 * @param {*} res
 */
user_order.exportList = async (req, res) => {
  let token_info = await base.checkAdminToken(req)
  if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
    res.send(base.result_error('登录失败'))
    return
  }
  let user_info = token_info.data

  //   let page_size = parseInt(req.body.page_size)
  //   let page_index = parseInt(req.body.page_index)
  //   if (!(page_size > 0) || !(page_index >= 0)) {
  //     res.send(base.result_error('分页参数错误', { page_index, page_size }))
  //     return
  //   }
  //   let limit = page_index * page_size

  let salerPhone = req.body.salerPhone
  let buyerPhone = req.body.buyerPhone
  let state = parseInt(req.body.state)
  let payState = parseInt(req.body.payState)
  let goodName = req.body.goodName
  let topUid = req.body.topUid
  let createdAtStart = req.body.createdAtStart
  let createdAtEnd = req.body.createdAtEnd
  // 要查总经销
  let user_sql = `SELECT uid, nickname, level1_recommender, level2_recommender, roles FROM user WHERE state > -1`
  let users = await mysql.query(user_sql, [])

  let sql = `SELECT a.*, b.code as '商品code', b.name as '商品name', c.nickname as '买方nickname', c.phone as '买方phone', c.avatar as '买方avatar', d.nickname as '卖方nickname', d.phone as '卖方phone', d.avatar as '卖方avatar',c.payee_name as '买方payeename',c.payee_bankname as '买方bankname',c.payee_bankno as '买方bankno',c.wxpay_img as '买方wxpay_img',c.alipay_img as '买方alipay_img' FROM user_order a 
    INNER JOIN goods_rush b ON a.gid=b.gid
    LEFT JOIN user c ON c.uid=a.uid 
    LEFT JOIN user d ON d.uid=a.saler_id
    WHERE a.order_id<>0`
  //   let sql_count = `SELECT COUNT(DISTINCT a.order_id) AS 'total_count' FROM user_order a
  //     INNER JOIN goods_rush b ON a.gid = b.gid
  //     LEFT JOIN user c ON c.uid=a.uid
  //     WHERE a.order_id<>0`
  let sql_params = []

  if (state > -1) {
    sql += ' AND a.state=? '
    // sql_count += ' AND a.state=? '
    sql_params.push(state)
  } else {
    sql += ' AND a.state<>-1 '
    // sql_count += ' AND a.state<>-1 '
  }
  if (payState > -1) {
    sql += ' AND a.pay_state=? '
    // sql_count += ' AND a.pay_state=? '
    sql_params.push(payState)
  } else {
    sql += ' AND a.pay_state<>-1 '
    // sql_count += ' AND a.pay_state<>-1 '
  }

  if (createdAtStart) {
    const start = moment(createdAtStart).format('YYYY-MM-DD HH:mm:ss')
    sql += ` AND a.create_time >= '${start}' `
    // sql_count += ` AND a.create_time >= '${start}' `
  }

  if (createdAtEnd) {
    const end = moment(createdAtEnd).format('YYYY-MM-DD HH:mm:ss')
    sql += ` AND a.create_time <= '${end}' `
    // sql_count += ` AND a.create_time <= '${end}' `
  }

  if (salerPhone) {
    user_sql = `SELECT uid FROM user WHERE phone LIKE ?`
    let saleUsers = await mysql.query(user_sql, [`%${salerPhone}%`])
    if (saleUsers.length > 0) {
      sql += ` AND a.saler_id IN (${saleUsers.map((v) => v.uid).join(',')})`
      //   sql_count += ` AND a.saler_id IN (${saleUsers
      //     .map((v) => v.uid)
      //     .join(',')})`
    }
  }
  if (buyerPhone) {
    user_sql = `SELECT uid FROM user WHERE phone LIKE ?`
    let buyUsers = await mysql.query(user_sql, [`%${buyerPhone}%`])
    // if (buyUsers.length > 0) {
    //   sql += ` AND a.uid IN (${buyUsers.map((v) => v.uid).join(',')})`
    //   sql_count += ` AND a.uid IN (${buyUsers.map((v) => v.uid).join(',')})`
    // }
  }

  if (topUid) {
    let uids = [topUid]
    // 递归获取当前用户相关的所有粉丝和二级粉丝
    getRecursionUids(uids, users)
    if (uids.length > 0) {
      sql += ` AND a.uid IN (${uids.join(',')})`
      //   sql_count += ` AND a.uid IN (${uids.join(',')})`
    }
  }

  // 商品名称
  if (goodName) {
    user_sql = `SELECT gid FROM goods_rush WHERE name LIKE ?`
    let filterGoods = await mysql.query(user_sql, [`%${goodName}%`])
    if (filterGoods.length > 0) {
      sql += ` AND a.gid IN (${filterGoods.map((v) => v.gid).join(',')})`
      //   sql_count += ` AND a.gid IN (${filterGoods.map((v) => v.gid).join(',')})`
    }
  }

  sql += ' ORDER BY a.create_time DESC,a.state DESC,a.order_id DESC '
  //   sql_params.push(limit)
  //   sql_params.push(page_size)

  let sql_result = await mysql.query(sql, sql_params)
  let topUserStatics = {}
  const workbook = [['订单号', '下单时间', '商品价格', '所属总销','商品信息','买方信息','卖方信息']]
  sql_result.forEach((result) => {
    let topUser
    if (result && result.uid) {
      const curUser = users.find((v) => v.uid === result.uid)
      const roles = (curUser&&curUser.roles && JSON.parse(curUser.roles)) || []
      // 只有非管理员有总销
      if (!roles.includes(1)) {
        // 先从统计数据中取值
        topUser = topUserStatics[result.uid]
        if (!topUser) {
          const curLinks = [result.uid]
          getRecommendLinks(curLinks, users)
          const curTopUser =
            users.find((user) => user.uid === curLinks[curLinks.length - 1]) ||
            {}
          // 避免重复计算，将数据缓存至统计数据中
          topUserStatics[result.uid] = curTopUser
          topUser = curTopUser
        }
      }
    }
    result.总销 = topUser || {}
    // const lineData = [
    //   ((result.g_price || 0) / 100).toFixed(2),
    //   result.买方nickname || '',
    //   result.买方phone || '',
    //   (topUser && topUser.nickname) || '',
    // ]
    // workbook.push(lineData)
    workbook.push([result.order_no||'', result.create_time||'', (result.g_price&&result.g_price/100)||'', (topUser && topUser.nickname) || '', result.商品name||'', result.买方nickname||'', result.卖方nickname||''])
  })

  const filename = `订单记录_${new Date()
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
}
/**
 * 取消订单【管理端】
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
 user_order.cancelOrder = async (req, res) => {
  let token_info = await base.checkAdminToken(req)
  if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
    res.send(base.result_error('登录失败'))
    return
  }

  let gid = parseInt(req.body.gid);
  if (!(gid > 0)) {
      res.send(base.result_error("商品id错误"));
      return;
  }

  let order_id = parseInt(req.body.order_id);
  if (!(order_id > 0)) {
      res.send(base.result_error("订单id错误"));
      return;
  }
  let uid = parseInt(req.body.uid);
  if (!(uid > 0)) {
      res.send(base.result_error("订单uid错误"));
      return;
  }

  let order_info = await mysql.query("SELECT * FROM user_order WHERE order_id=? AND uid=? ", [order_id, uid]);
  if (order_info.length == 0) {
      res.send(base.result_error("取消失败,没有找到订单"));
      return;
  }
  order_info = order_info[0];

  let sql = `UPDATE goods_rush SET state=1,rusher_id=0 WHERE rusher_id=? AND state=2 AND gid=? AND current_order_id=?`;

  let sql_result = await mysql.query(sql, [uid, gid, order_id]);
  if (sql_result.affectedRows == 1) {
      // 更新订单
      // 取消订单回去到抢购列表中
      let goodsinfo = await mysql.query(`SELECT a.*,b.nickname belong_nickname,b.avatar belong_avatar FROM goods_rush a LEFT JOIN user b ON b.uid=a.belong WHERE a.gid=?`, [gid]);
      await redis.Client0.hSet(`${KEYS.RUSH_GOODS}${order_info.schedule_id}`, gid.toString(), JSON.stringify(goodsinfo[0]));
      await mysql.query("UPDATE user_order SET state=-1 WHERE order_id=? AND uid=?", [order_id, uid]);
      await redis.Client0.hSet(`${KEYS.RUSH_GOODS_COUNTER}${order_info.schedule_id}`, gid.toString(), '1');
      res.send(base.result_ok("取消成功"));
      return;
  }
  res.send(base.result_error("取消失败"));
};
// ---- private ----

module.exports = user_order
