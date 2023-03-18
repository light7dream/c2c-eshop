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

const config = require('../package.json').config;
const redisClient = require('redis');
const KEYS = require('../server_modules/redis_key');
const moment = require('moment')

/**
 * 创建redis连接
 */
function getInstance(db) {
    let client = redisClient.createClient({
        url: config.redis
    });
    client.on('connect', async function () {
        client.select(db);
        console.log(`redis${db} is connect.`);
    });
    client.on('error', async err => {
        console.log(`redis${db} is running error.`);
        console.log(err);
    });
    client.connect();
    return client;
}

const pool = mysql.createPool({
  host: 'localhost',
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
    let sql = `SELECT uid, nickname, phone, level1_recommender, level2_recommender, roles FROM user WHERE state < 1`
    let users = await sqlquery(sql, [])
    return users
  }

  const sleep = async (time) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }

  const run  = async () => {
    const client1 = getInstance(1)
    await sleep(5000)
    let keys = await client1.keys('token_*');
    console.log('🚀 ~ file: refreshRedis.js ~ line 125 ~ run ~ keys', keys)
    await client1.del(keys);
    // for(let key of keys){
    //   // const userInfoStr = await client1.get(key)
    //   // if(userInfoStr){
    //   //   const userInfo = JSON.parse(userInfoStr)
    //   //   if(userInfo.uid){
    //   //     const uid = userInfo.uid
    //   //     const user = await sqlquery(`SELECT * FROM user WHERE uid = ?`, [uid])
    //   //     if(user){
    //   //       const keysArr = []
    //   //       let sql_params = []
    //   //       Object.keys(userInfo).forEach(k=>{
    //   //         if(!['uid','address_list','has_sign','members'].includes(k)&&userInfo[k]){
    //   //           let val = userInfo[k]
    //   //           if(k==='roles'){
    //   //             val = JSON.stringify(val)
    //   //           }
    //   //           keysArr.push(k)
    //   //           sql_params.push(val)
    //   //         }
    //   //       })
    //   //       sql_params.push(uid)
    //   //       let sql = `UPDATE user SET ${keysArr.join('=?, ')}=? WHERE uid = ?`
    //   //       await sqlquery(sql, sql_params)
    //   //     } else {
    //   //       sql_params = []
    //   //       const keysArr = []
    //   //       Object.keys(userInfo).forEach(k=>{
    //   //           keysArr.push(k)
    //   //           sql_params.push(userInfo[k])
    //   //         })
    //   //         console.log('🚀 ~ file: refreshRedis.js ~ line 150 ~ Object.keys ~ sql_params', sql_params)
    //   //       let sql = `INSERT INTO user (${keysArr.join(', ')}) VALUES (${keysArr.map(()=>'?').join(', ')})`
    //   //       console.log('🚀 ~ file: refreshRedis.js ~ line 152 ~ run ~ sql', sql)
    //   //       await sqlquery(sql, sql_params)
    //   //     }
          
    //   //   }
    //   // }

    // }
    console.info('done')
  }
  run()