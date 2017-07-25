import createRouter from './content/api'
import buildContent from './content/build'
import { mdParser, yamlParser } from './util/parsers'

const { existsSync } = require('fs')
const { resolve, join } = require('path')

const port = process.env.PORT || process.env.npm_package_config_nuxt_port || 3000
const host = process.env.HOST || process.env.npm_package_config_nuxt_host || 'localhost'

const nuxtentConfig = (nuxtOpts) => {
  const rootConfig = resolve(nuxtOpts.rootDir, 'nuxtent.config.js')
  if (existsSync(rootConfig)) {
    try {
      return require(rootConfig)
    } catch (err) {
      throw new Error (`[Invalid Nuxtent configuration] ${err}`)
    }
  } else return nuxtOpts.nuxtent
}

const contentOptions = (content, defaults) => {
  const opts = {}
  if (!Array.isArray(content)) opts['/'] = { ...defaults, ...content }
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

const apiOptions = (opts, defaults, isProd) => {
  const baseURL = opts && opts.baseURL ? opts.baseURL(isProd) : defaults.baseURL
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
      permalink: ':slug',
      anchorsLevel: 1,
      isPost: true,
      data: {},
      routes: null
    }),

    parsers: {
      md: Object.assign({}, {
        highlight: null,
        use: []
      }, userOptions.parsers && userOptions.parsers.md ? userOptions.parsers.md : {}),
      mdParser,
      yamlParser
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

  buildContent({
    nuxt: this,
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
