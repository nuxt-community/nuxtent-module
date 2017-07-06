const { existsSync } = require('fs')
const { resolve } = require('path')

const reqPlugin = resolve(__dirname, './plugin.js')

function getModuleOptions (nuxtOpts) {
  const contentVars =  {
    srcPath: nuxtOpts.srcDir,
    srcDir: 'content',
    layoutDir: 'layouts/content',
    layout: 'default',
    route: '',    // no route
    dirs: ['/'],  // all files
    permalink: ':slug',
    isPost: true,
    data: {}
  }

  const rootConfig = resolve(nuxtOpts.srcDir, 'nuxt.content.js')
  const userOpts = existsSync(rootConfig) ? require(rootConfig) : nuxtOpts.content

  return Object.assign({}, contentVars, userOpts)
}

module.exports = function contentModule() {
  const options = getModuleOptions(this.options)
  const content = require('./content.js').default(options)

  this.addPlugin({ src: reqPlugin })

  if (!('generate' in this.options)) this.options.generate = {}
  this.options.generate.routes = [
    'projects/ency'
  ]
}

module.exports.meta = require('../package.json')
