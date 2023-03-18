let mysql = require('../mysql')
const utils = {}
/**
 * 递归获取某个用户的所有一级粉丝、二级粉丝及这些粉丝的所有粉丝
 * @param {Array[Number]} uids 当前找到的所有粉丝uid
 * @param {Array[Object]} users 所有用户数据
 * @returns {*} Null
 */
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

const getRecursionUids_v2 = (uids, users) => {
  let searchUids = []
  users.forEach((v) => {
    if (
      !uids.includes(v.uid) &&
      (uids.includes(v.level1_recommender))
    ) {
      searchUids.push(v.uid)
    }
  })
  // 找不到包含的粉丝uid时，终止递归
  if (searchUids.length === 0) {
    return
  }
  uids.push(...searchUids)
  getRecursionUids_v2(uids, users)
}

utils.getRecursionUids = getRecursionUids
utils.getRecursionUids_v2 = getRecursionUids_v2
/**
 * 获取某个用户的总销及粉丝推荐链条
 * @param {Array[Number]} userLinkRecords 目前的粉丝推荐链条,必须包含要查找的uid
 * @param {Array[Object]} users 所有用户数据
 * @returns {*} Null
 */
const getRecommendLinks = (userLinkRecords, users) => {
  let originalSaler
  if (userLinkRecords.length > 0 && users.length > 0) {
    const ulrLen = userLinkRecords.length
    const curUid = userLinkRecords[ulrLen - 1]
    // 当前推荐链条最新的一条
    const curUser = users.find((v) => v&&v.uid === curUid)
    if (curUser) {
      try {
        const roles = (curUser&&curUser.roles && JSON.parse(curUser.roles)) || []
        if (roles.includes(1)) return
        const nextUid = curUser.level1_recommender
        if (!nextUid) return
        const nextUser = users.find((v) => v.uid === nextUid)
        if (nextUser) {
          // 如果下一个用户是管理员，则不压入推荐链条
          const nextRoles = (nextUser.roles && JSON.parse(nextUser.roles)) || []
          if (nextRoles.includes(1)) return
          userLinkRecords.push(nextUid)
          getRecommendLinks(userLinkRecords, users)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
}

utils.getRecommendLinks = getRecommendLinks

// 获取所有用户
const getAllUsers = async () => {
  let sql = `SELECT uid, nickname, phone, level1_recommender, level2_recommender, roles FROM user WHERE state > -1`
  let users = await mysql.query(sql, [])
  return users
}

utils.getAllUsers = getAllUsers

module.exports = utils
