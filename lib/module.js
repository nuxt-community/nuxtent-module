import createRouter from './core/api'
import interceptRoutes from './core/routes'
import buildContent from './core/build'

const { existsSync } = require('fs')
const { resolve, join } = require('path')

const port = process.env.PORT || process.env.npm_package_config_nuxt_port || 3000
const host = process.env.HOST || process.env.npm_package_config_nuxt_host || 'localhost'

const nuxtentConfig = (nuxtOpts) => {
  const rootConfig = resolve(nuxtOpts.rootDir, 'nuxtent.config.js')
  return existsSync(rootConfig) ? require(rootConfig) : nuxtOpts.content
}

const contentOptions = (content, defaults) => {
  const opts = {}
  if (typeof content === 'object') opts['/'] = { ...defaults, ...content }
  else {
    content.forEach(registeredArr => {
      const dirName = registeredArr[0]
      const dirOpts = registeredArr[1]
      if (dirName === '/' && registered.length > 1) { // prevent endpoint conflict
        throw new Error('Top level files not allowed with nested registered directories')
      }
      opts[join('/', dirName)] = { ...defaults, ...dirOpts }
    })
  }
  return opts
}

const apiOptions = (api, defaults, isProd) => {
  const baseURL = api && api.baseURL ? api.baseURL(isProd) : defaults.baseURL
  return { baseURL }
}

export default function ContentModule(moduleOpts) {
  const userOptions = nuxtentConfig(this.options)

  const options =  {
    isDev: this.nuxt.dev,
    srcPath: this.options.rootDir,
    sitePath: this.options.srcDir,
    srcDir: '/content',
    componentsDir: '/components',
    buildDir: `/content`,

    content: contentOptions(userOptions.content, {
      routeName: null,
      permalink: ':slug',
      isPost: true,
      data: {}
    }),

    parser: {
      md: {
        highlight: null,
        use: []
      },
      ...userOptions.parser
    },

    api: {
      ...apiOptions(userOptions.api, {
        baseURL: `http://${host}:${port}`
      }, !this.nuxt.dev),
      serverPrefix: `/content-api`,
      browserPrefix: `/_nuxt/content`
    }
  }

  const { isDev, srcDir, content, api } = options

  // 1. Configure and build dynamic content pages

  this.options.build.loaders.push({
    test: /\.comp\.md$/,
    use: [
      'vue-loader',
      { loader: 'nuxtent/dist/loader.js', options }
    ]
  })

  this.extendRoutes(routes => interceptRoutes(routes, content))

  buildContent({
    nuxt: this.options,
    options
  })

  // 2. Add content API

  this.addServerMiddleware({
    path: api.serverPrefix,
    handler: createRouter(options)
  })

  // 3. Add request helpers

  this.requireModule([
    '@nuxtjs/axios', {
      baseURL: api.baseURL + api.serverPrefix,
      browserBaseURL: api.baseURL + (isDev ? api.serverPrefix : api.browserPrefix)
    }
  ])

  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    options: {
      ...options,
      srcDirFromPlugin: join('../', srcDir)
    }
  })
}

module.exports.meta = require('../package.json')
