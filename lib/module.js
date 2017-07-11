import getContent from './core/content'
import createRouter from './core/api'
import interceptRoutes from './core/routes'
import buildContent from './core/build'

const { existsSync } = require('fs')
const { resolve } = require('path')

const port = process.env.PORT || process.env.npm_package_config_nuxt_port || 3000
const host = process.env.HOST || process.env.npm_package_config_nuxt_host || 'localhost'

const contentOptions = (nuxtOpts) => {
  const rootConfig = resolve(nuxtOpts.rootDir, 'nuxt.content.js')
  return existsSync(rootConfig) ? require(rootConfig) : nuxtOpts.content
}

export default function ContentModule() {
  const clientOpts =  {
    baseURL: `http://${host}:${port}`,
    srcPath: this.options.rootDir,
    srcDir: 'content',
    routeName: '',    // no route
    dirs: ['/'],  // all files
    permalink: ':slug',
    isPost: true,
    data: {},
    ...contentOptions(this.options) // merge user options
  }

  const apiOpts = {
    isStatic: !this.nuxt.dev,
    apiPrefix: this.nuxt.dev ? '/content-api' : `/_nuxt/${clientOpts.srcDir}`,
  }

  const options = { ...clientOpts, ...apiOpts }

  const contentMap = getContent(options)

  // Build dynamic content pages
  buildContent({
    nuxt: this.options,
    contentMap,
    ...options
  })

  // Reconfigure route paths
  this.extendRoutes(routes => interceptRoutes(routes, options))

  // Add content API
  this.addServerMiddleware({
    path: options.apiPrefix,
    handler: createRouter(contentMap, options)
  })

  // Add response helpers
  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    options
  })
}

module.exports.meta = require('../package.json')
