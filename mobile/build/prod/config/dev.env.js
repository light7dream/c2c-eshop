'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  wxDomain:'""',
  appId: '"wx4f19265180ae4075"',
  title: '"当代摩玛"',
  logo: '"logo.jpg"'
})
