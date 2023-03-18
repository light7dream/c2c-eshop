'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  wxDomain:'"qijiemoka.meetmoma.com"',
  appId: '"wx7756c1b265dd48bc"',
  title: '"奇界摩卡"',
  logo: '"logo-qijiemoka.jpg"'
})
