'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  wxDomain:'""',
  appId: '"wx83e5de3bc1fd3ebd"',
  title: '"祥清阁"',
  logo: '"logo.jpg"'
})
