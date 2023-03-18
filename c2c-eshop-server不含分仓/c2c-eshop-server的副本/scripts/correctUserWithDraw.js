const mysql = require('mysql')

// const config = {
//   register_url: 'https://wx.meetmoma.com/register',
//   OssRegion: 'oss-cn-beijing',
//   OssBucket: 'meetingmoma-eshop',
//   OssAccessKeyId: 'LTAI5tM6A7bqmun8Y2CeDpzN',
//   OssAccessKeySecret: 'TnFaaCQK5uEBrPmMSA2Z4atJkgHiQd',
// }
// const config = require('../package.json').config
// var client = new OSS({
//   region: config.OssRegion,
//   accessKeyId: config.OssAccessKeyId,
//   accessKeySecret: config.OssAccessKeySecret,
//   bucket: config.OssBucket,
// })

const pool = mysql.createPool({
  host: '39.101.130.216',
  user: 'root',
  password: 'DigiCostarDB))1',
  database: 'c2c_eshop',
  port: 30001,
  charset: 'utf8',
  timezone: '08:00',
  multipleStatements: true,
})

const sqlquery = async (sql, params) => {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.error(
          moment().format() + ' sql.query:' + err + '----sql:' + sql
        )
        reject(err)
      }
      // console.error(sql, params)
      connection.query(sql, params, function (err, result) {
        if (err) {
          console.error(
            moment().format() +
              '\n #### sql.query:' +
              err +
              '\n----sql:' +
              sql +
              '\n----param:' +
              params
          )
          reject(err)
        }

        //console.log(result);
        resolve(result)
      })
      //回收pool
      connection.release()
    })
  })
}

const getRecursionUids = (uids, users) => {
    let searchUids = []
    users.forEach((v) => {
      if (
        !uids.includes(v.uid) &&
        (uids.includes(v.level1_recommender) ||
          uids.includes(v.level2_recommender))
      ) {
        searchUids.push(v.uid)
      }
    })
    // 找不到包含的粉丝uid时，终止递归
    if (searchUids.length === 0) {
      return
    }
    uids.push(...searchUids)
    getRecursionUids(uids, users)
  }
  
  
  // 获取所有用户
  const getAllUsers = async () => {
    let sql = `SELECT uid, nickname, phone, level1_recommender, level2_recommender, roles FROM user WHERE state > -1`
    let users = await sqlquery(sql, [])
    return users
  }

  const run  = async (uid) => {
    const users = await getAllUsers()
    const uids = users.map((v) => v.uid).filter(Boolean)
    let sql = `DELETE FROM user_withdrawal WHERE uid not in (${uids.join(',')})`
    await sqlquery(sql, [])
    console.info('done')
    process.exit(1)
  }
  run(214)