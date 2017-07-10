import getContent from './core/content.js'
import { getRoutes, interceptRoutes } from './core/routes.js'
import createRouter from './core/api'

const { existsSync } = require('fs')
const { resolve } = require('path')

const contentOptions = (nuxtOpts) => {
  const rootConfig = resolve(nuxtOpts.rootDir, 'nuxt.content.js')
  return existsSync(rootConfig) ? require(rootConfig) : nuxtOpts.content
}

export default function ContentModule() {
  const defaults =  {
    srcPath: this.options.rootDir,
    srcDir: 'content',
    routeName: '',    // no route
    dirs: ['/'],  // all files
    permalink: ':slug',
    isPost: true,
    data: {}
  }

  const options = Object.assign({}, defaults, contentOptions(this.options))
  const contentMap = getContent(options)

  // Add content API

  this.addServerMiddleware({
    path: `/content-api`,
    handler: createRouter(contentMap, options)
  })

  // Add request helpers

  // this.addPlugin({
    // src: resolve(__dirname, 'plugin.js')
    // ,
    // options: { content: contentMap }
  // })

  // Build dynamic content pages

  this.extendRoutes(routes => interceptRoutes(routes, options))

  if (!('generate' in this.options)) this.options.generate = {}
  const gen = this.options.generate
  gen.routes = gen.routes && Array.isArray(gen.routes)
    ? Array.concat(routes, getRoutes(contentMap))
    : getRoutes(contentMap)
}

module.exports.meta = require('../package.json')
