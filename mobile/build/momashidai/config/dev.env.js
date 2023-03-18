'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  wxDomain:'""',
  appId: '"wxd285ca322e0720dc"',
  title: '"摩码时代商城"',
  logo: '"logo-momashidai.jpg"'
})
