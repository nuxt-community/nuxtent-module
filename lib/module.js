import createRouter from './core/api'
import interceptRoutes from './core/routes'
import buildContent from './core/build'

const { existsSync } = require('fs')
const { resolve, join } = require('path')

const port = process.env.PORT || process.env.npm_package_config_nuxt_port || 3000
const host = process.env.HOST || process.env.npm_package_config_nuxt_host || 'localhost'

const contentOptions = (nuxtOpts) => {
  const rootConfig = resolve(nuxtOpts.rootDir, 'nuxt.content.js')
  return existsSync(rootConfig) ? require(rootConfig) : nuxtOpts.content
}

const dirsOptions = (options) => {
  const defaultOpts = { ...options }
  delete defaultOpts.dirs

  const dirs = {}
  options.dirs.forEach(registeredArr => {
    const dirName = registeredArr[0]
    const dirOpts = registeredArr[1]
    if (dirName === '/' && options.dirs.length > 1) { // prevent endpoint conflict
      throw new Error('Top level files not allowed with nested registered directories')
    }
    dirs[join('/', dirName)] = { ...defaultOpts, ...dirOpts }
  })
  return dirs
}

export default function ContentModule() {
  const options =  {
    // nuxt options
    isDev: this.nuxt.dev,
    srcPath: this.options.rootDir,

    // content defaults
    buildDir: `/content`,
    srcDir: 'content',
    componentsDir: '/components',
    routeName: null,
    permalink: ':slug',
    isPost: true,
    data: {},
    dirs: ['/'], // all root files

    // api defaults
    baseURL: `http://${host}:${port}`,
    apiPrefix: `/content-api`,
    browserPrefix: `/_nuxt/content`,

    // merge user options
    ...contentOptions(this.options)
  }

  const registeredDirs = dirsOptions(options)

  // 1. Configure and build dynamic content pages

  this.options.build.loaders.push({
    test: /\.comp\.md$/,
    use: [
      'vue-loader',
      { loader: '@nuxtjs/content/dist/loader.js', options }
    ]
  })

  this.extendRoutes(routes => interceptRoutes(routes, options))

  buildContent({
    nuxt: this.options,
    registeredDirs,
    options
  })

  // 2. Add content API

  this.addServerMiddleware({
    path: options.apiPrefix,
    handler: createRouter(registeredDirs)
  })

  // 3. Add request helpers

  const { isDev, baseURL, apiPrefix, browserPrefix } = options

  this.requireModule([
    '@nuxtjs/axios', {
      baseURL: baseURL + apiPrefix,
      browserBaseURL: baseURL + (isDev ? apiPrefix : browserPrefix)
    }
  ])

  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    options
  })
}

module.exports.meta = require('../package.json')
