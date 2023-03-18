const mysql = require('mysql')
var qr = require('qr-image')
let fs = require('fs')
var co = require('co')
var OSS = require('ali-oss')
const moment = require('moment')
// const config = {
//   register_url: 'https://wx.meetmoma.com/register',
//   OssRegion: 'oss-cn-beijing',
//   OssBucket: 'meetingmoma-eshop',
//   OssAccessKeyId: 'LTAI5tM6A7bqmun8Y2CeDpzN',
//   OssAccessKeySecret: 'TnFaaCQK5uEBrPmMSA2Z4atJkgHiQd',
// }
const config = require('../package.json').config
var client = new OSS({
  region: config.OssRegion,
  accessKeyId: config.OssAccessKeyId,
  accessKeySecret: config.OssAccessKeySecret,
  bucket: config.OssBucket,
})

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

const sqlquery = function (sql, params) {
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
const createQr = function (content, type = 'png', size = 8, margin = 2) {
  let qr_png = qr.image(content, { type: type, size: size, margin: margin })
  return qr_png
}
const upload = function (uid, fileData) {
  return new Promise((resolve, reject) => {
    co(function* () {
      var result = yield client.put('qr-code/' + uid + '_qr.jpg', fileData)
      resolve(result)
    }).catch(function (err) {
      console.log(`${uid} 二维码上传失败`)
      reject(err)
    })
  })
}
const run = async (originStr, replaceStr) => {
  // user表
  const users = await sqlquery('SELECT * FROM user')
  for (let user of users) {
    let qr_data = `${config.register_url}?rid=${user.uid}`
    let qrFileData = createQr(qr_data)
    let result = await upload(user.uid, qrFileData)
    let qr_url = result.url.replace('http://', 'https://')
    await sqlquery('UPDATE user SET qrcode=? WHERE uid=?', [qr_url, user.uid])
    // // avatar
  //   if (user.avatar) {
  //     let newAvatar = user.avatar.replace(originStr, replaceStr)
  //     await sqlquery('UPDATE user SET avatar=? WHERE uid=?', [
  //       newAvatar,
  //       user.uid,
  //     ])
  //   }
  //   // qrcode
  //   if (user.qrcode) {
  //     // 上传到oss
  //     let newAvatar = user.qrcode.replace(originStr, replaceStr)
  //     await sqlquery('UPDATE user SET qrcode=? WHERE uid=?', [
  //       newAvatar,
  //       user.uid,
  //     ])
  //   }
  //   // sign
  //   if (user.sign) {
  //     let newAvatar = user.sign.replace(originStr, replaceStr)
  //     await sqlquery('UPDATE user SET sign=? WHERE uid=?', [
  //       newAvatar,
  //       user.uid,
  //     ])
  //   }
  // }
  // // goods_category表
  // const goodsCategories = await sqlquery('SELECT * FROM goods_category')
  // for (let goodsCategory of goodsCategories) {
  //   // avatar
  //   if (goodsCategory.img) {
  //     let newImg = goodsCategory.img.replace(
  //       'costar-eshop',
  //       'meetingmoma-eshop'
  //     )
  //     await sqlquery('UPDATE goods_category SET img=? WHERE cid=?', [
  //       newImg,
  //       goodsCategory.cid,
  //     ])
  //   }
  // }
  // // goods_rush表
  // const goods_rushs = await sqlquery('SELECT * FROM goods_rush')
  // for (let goods_rush of goods_rushs) {
  //   // avatar
  //   if (goods_rush.img.length > 0) {
  //     let imgs = []
  //     const rushImgs = JSON.parse(goods_rush.img)
  //     rushImgs.forEach((img) => {
  //       let newImg = img.replace(originStr, replaceStr)
  //       imgs.push(newImg)
  //     })
  //     await sqlquery('UPDATE goods_rush SET img=? WHERE gid=?', [
  //       JSON.stringify(imgs),
  //       goods_rush.gid,
  //     ])
  //   }
  // }

  // // goods_shelves表
  // const goods_shelves = await sqlquery('SELECT * FROM goods_shelves')
  // for (let goods_shelve of goods_shelves) {
  //   // avatar
  //   if (goods_shelve.img.length > 0) {
  //     let imgs = []
  //     const rushImgs = JSON.parse(goods_shelve.img)
  //     rushImgs.forEach((img) => {
  //       let newImg = img.replace(originStr, replaceStr)
  //       imgs.push(newImg)
  //     })
  //     await sqlquery('UPDATE goods_shelves SET img=? WHERE gid=?', [
  //       JSON.stringify(imgs),
  //       goods_shelve.gid,
  //     ])
  //   }
  // }
  // // user_order_payimg表
  // const user_order_payimgs = await sqlquery('SELECT * FROM user_order_payimg')
  // for (let user_order_payimg of user_order_payimgs) {
  //   // avatar
  //   if (user_order_payimg.img) {
  //     let newImg = user_order_payimg.img.replace(
  //       originStr,
  //       replaceStr
  //     )
  //     await sqlquery('UPDATE user_order_payimg SET img=? WHERE id=?', [
  //       newImg,
  //       user_order_payimg.id,
  //     ])
  //   }
  }
  console.info('done')
  process.exit(1)
}

run('meetingmoma-eshop', config.OssBucket)
