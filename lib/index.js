const { existsSync } = require('fs')
const { resolve } = require('path')

function getModuleOptions (nuxtOpts, contentVars) {
  const rootConfig = resolve(nuxtOpts.srcDir, 'nuxt.content.js')
  const userOpts = existsSync(rootConfig) ? require(rootConfig) : nuxtOpts.content
  return Object.assign({}, contentVars, userOpts)
}

module.exports = function contentModule() {
  const contentConfig = require('./config.js')(this.options)
  const options = getModuleOptions(this.options, contentConfig.vars)

  const content = require('./content.js').default(options)

  this.options.build.loaders.push(contentConfig.loader)
  this.addPlugin({ src: contentConfig.plugin })

  // loader to compile markdown files
  // extend and generate dynamic routes
}

module.exports.meta = require('../package.json')
