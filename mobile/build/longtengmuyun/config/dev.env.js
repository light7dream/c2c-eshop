'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  wxDomain:'""',
  appId: '"wxf05f4e62c4a8995d"',
  title: '"Mu云商城"',
  logo: '"logo-longtengmuyun.jpg"'
})
