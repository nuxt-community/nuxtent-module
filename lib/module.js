/* eslint-disable import/no-extraneous-dependencies */
import { resolve, join } from 'path'

/* covered by nuxt */
import express from 'express'

import pkg from '../package.json'

import createRouter from './content/api'
import buildContent from './content/build'
import { mdParser, yamlParser } from './util/parsers'

const nuxtentConfig = rootDir => {
  const rootConfig = join(rootDir, 'nuxtent.config.js')
  try {
    return require(rootConfig)
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return false
    }
    throw new Error(`[Invalid Nuxtent configuration] ${err}`)
  }
}

const contentOptions = (content, defaults) => {
  const opts = {}
  if (!Array.isArray(content)) {
    opts['/'] = { ...defaults, ...content }
  } else {
    content.forEach(entry => {
      const entryIsArray = Array.isArray(entry)
      const dirName = entryIsArray ? entry[0] : entry
      const dirOpts = entryIsArray ? entry[1] : {}
      if (dirName === '/' && content.length > 1) {
        // prevent endpoint conflict
        throw new Error(
          'Top level files not allowed with nested registered directories'
        )
      }
      opts[join('/', dirName)] = { ...defaults, ...dirOpts }
    })
  }
  return opts
}

export default function ContentModule (moduleOpts) {
  const userOptions =
    nuxtentConfig(this.options.rootDir) || this.options.nuxtent || {}

  const options = {
    isDev: this.nuxt.options.dev,
    srcPath: this.options.rootDir,
    sitePath: this.options.srcDir,
    srcDir: '/content',
    componentsDir: '/components',
    buildDir: `/content`,
    isStatic: userOptions.isStatic || process.env.STATIC || false,
    port: process.env.PORT || process.env.npm_package_config_nuxt_port || 3000,

    content: contentOptions(userOptions.content, {
      page: null,
      permalink: ':slug',
      anchorsLevel: 1,
      isPost: true,
      generate: []
    }),

    parsers: {
      md: Object.assign(
        {},
        {
          highlight: null,
          use: []
        },
        userOptions.parsers && userOptions.parsers.md
          ? userOptions.parsers.md
          : {}
      ),
      mdParser,
      yamlParser
    },

    api: {
      baseURL: '',
      ...userOptions.api,
      serverPrefix: `/content-api`,
      browserPrefix: `/_nuxt/content`
    }
  }

  const vueLoaderOptions = {
    componentsDir: join(options.sitePath, options.componentsDir),
    extensions: ['.vue', '.js'],
    content: {
      ...options.content
    },
    parsers: {
      ...options.parsers
    }
  }

  const { srcDir, api } = options

  // 1. Configure and build dynamic content pages

  this.extendBuild(config => {
    config.module.rules.push({
      test: /\.comp\.md$/,
      use: [
        'vue-loader',
        { loader: 'nuxtent/dist/loader.js', options: vueLoaderOptions }
      ]
    })
  })

  buildContent({
    nuxt: this,
    options
  })

  // 2. Add content API
  const router = createRouter(options)

  // Add API when running `nuxt` & `nuxt build` (development and production)
  this.addServerMiddleware({
    path: api.serverPrefix,
    handler: router
  })

  // Add API when running `nuxt generate`
  this.nuxt.plugin('generator', generator => {
    const app = express()
    app.use(api.serverPrefix, router)
    const server = app.listen(options.port)

    generator.plugin('generated', () => {
      server.close()
    })
  })

  // 3. Add request helpers

  this.requireModule([
    '@nuxtjs/axios',
    {
      baseURL: api.baseURL + api.serverPrefix,
      browserBaseURL:
        api.baseURL +
        (process.env.STATIC ? api.browserPrefix : api.serverPrefix)
    }
  ])

  this.addPlugin({
    src: resolve(__dirname, 'plugins/requestContent.js')
  })

  // 4. Add Markdown Components

  this.addPlugin({
    src: resolve(__dirname, 'plugins/markdownComponents.template.js'),
    options: {
      srcDirFromPlugin: '~/' + srcDir
    }
  })
}

export { pkg as meta }
