const { existsSync } = require('fs')
const { resolve } = require('path')

const getContent = require('./content.js').default
const { getRoutes, interceptRoutes } = require('./routes.js')
const reqPlugin = resolve(__dirname, 'plugin.js')

function getModuleOptions (nuxtOpts) {
  const contentVars =  {
    srcPath: nuxtOpts.rootDir,
    srcDir: 'content',
    routeName: '',    // no route
    dirs: ['/'],  // all files
    permalink: ':slug',
    isPost: true,
    data: {}
  }

  const rootConfig = resolve(nuxtOpts.rootDir, 'nuxt.content.js')
  const userOpts = existsSync(rootConfig) ? require(rootConfig) : nuxtOpts.content

  return Object.assign({}, contentVars, userOpts)
}

module.exports = function contentModule() {
  const options = getModuleOptions(this.options)
  const content = getContent(options)

  // Integrate content with Nuxt Client

  this.addPlugin({ src: reqPlugin, options: { content } })

  // Integrate content with Nuxt Build

  this.extendRoutes(routes => interceptRoutes(routes, content, options))

  if (!('generate' in this.options)) this.options.generate = {}
  const gen = this.options.generate
  gen.routes = gen.routes && Array.isArray(gen.routes)
    ? Array.concat(routes, getRoutes(content))
    : getRoutes(content)
}

module.exports.meta = require('../package.json')
