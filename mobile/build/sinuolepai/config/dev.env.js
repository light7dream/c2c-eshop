'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  wxDomain:'""',
  appId: '"wx472a58030a2f6e8b"',
  title: '"斯诺乐拍商城"',
  logo: '"logo-sinuolepai.jpg"'
})
