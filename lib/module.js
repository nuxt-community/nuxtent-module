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

const mergeContentOptions = (content, defaults) => {
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

const CONTENT_DIR = 'content'
const COMPONENTS_DIR = 'components'
const BUILD_DIR = 'content'

export default function ContentModule(moduleOpts) {
  const userOptions =
    nuxtentConfig(this.options.rootDir) || this.options.nuxtent || {}

  const content = mergeContentOptions(userOptions.content, {
    page: null,
    permalink: ':slug',
    anchorsLevel: 1,
    isPost: true,
    generate: []
  })

  const componentsDir = join(this.options.rootDir, COMPONENTS_DIR)
  const contentDir = join(this.options.srcDir, CONTENT_DIR)
  const contentDirWebpackAlias = '~/' + CONTENT_DIR
  const port =
    process.env.PORT || process.env.npm_package_config_nuxt_port || 3000
  const isDev = this.nuxt.options.dev
  const loaderComponentExtensions = ['.vue', '.js']

  const api = {
    baseURL: '',
    ...userOptions.api,
    serverPrefix: `/content-api`,
    browserPrefix: `/_nuxt/content`
  }

  const parsers = {
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
  }

  const routesOptions = {
    contentDir,
    content,
    parsers,
    isDev
  }

  // 1. Generate Vue templates from markdown with components (*.comp.md)
  this.extendBuild(config => {
    config.module.rules.push({
      test: /\.comp\.md$/,
      use: [
        'vue-loader',
        {
          loader: 'nuxtent/dist/loader.js',
          options: {
            componentsDir,
            extensions: loaderComponentExtensions,
            content,
            parsers
          }
        }
      ]
    })
  })

  // 2. Build dynamic content pages without components (*.md)
  buildContent(this, BUILD_DIR, routesOptions)

  // 3. Add content API
  const router = createRouter(api, routesOptions)

  // Add API when running `nuxt` & `nuxt build` (development and production)
  this.addServerMiddleware({
    path: api.serverPrefix,
    handler: router
  })

  // Add API when running `nuxt generate`
  this.nuxt.plugin('generator', generator => {
    const app = express()
    app.use(api.serverPrefix, router)
    const server = app.listen(port)

    generator.plugin('generated', () => {
      server.close()
    })
  })

  // 4. Add request helpers
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

  // 5. Add Vue templates generated from markdown to output build
  this.addPlugin({
    src: resolve(__dirname, 'plugins/markdownComponents.template.js'),
    options: {
      contentDirWebpackAlias
    }
  })
}

export { pkg as meta }
