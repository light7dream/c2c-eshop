'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  wxDomain:'""',
  appId: '"wxde1fd7f47dc57175"',
  title: '"ATO无界时尚"',
  logo: '"logo-ato.jpg"'
})
