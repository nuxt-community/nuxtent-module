import { URL } from 'url'
import { join } from 'path'

import anchors from 'markdown-it-anchor'
import { merge } from 'lodash'

import markdownit from 'markdown-it'

import slugify from './slugify'

import logger from './debug'
/**
 * @typedef {(Boolean|Number|Object)} TocConfig Configuration for toc
 * @property {Number} level The level of headings to parse
 * @property {Boolean} permalink Wether if attach a permalink to the heading
 * @property {String} permalinkClass The class to add to the permalink
 * @property {String} permalinkSymbol The text content of the permalink
 * @property {Function} slugify The slugify function to use
 */

/**
 * @typedef {Object} NuxtentMarkdownConfig The markdown config
 * @property {Object} markdown.plugins The plugins to use on markdown-it
 * @property {Function} [markdown.extend] Function that recibes the markdown-it config and returns a valid markdown-it config
 * @property {Function} [markdown.customize] Function that recibes the markdown-it instance
 */

/**
 * @typedef {Object} NuxtentContentGroup Content group
 * @property {Boolean} isPost Whether if the content is blog like or not
 * @property {Object} data Data to inject into every entry
 * @property {Boolean} breadcrumbs Whether if insert breacrumbs
 * @property {TocConfig} toc The toc configuration for the content group
 * @property {String} page The vue template to use
 * @property {String} permalink The permalink route
 * @property {Array} generate The methods to generate when using static build.
 *  Possible values are get, getAll and only
 * @property {NuxtentMarkdownConfig} markdown The markdown-it config
 */

/**
 * @typedef {Object} NuxtentConfig - Config for nuxtent module
 * @property {NuxtentContentGroup} content - An object of objects defining the content configuration
 * @property {Boolean} debug - Weather or not start in debuging mode
 * @property {String} contentDir
 * @property {Object} api - Api configuration
 */

/**
 * @description The config instance
 *
 * @export
 * @class NuxtentConfig
 */

const markdownParser = md => {
  const config = {
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true
  }
  if (typeof md.extend === 'function') {
    md.extend(config)
  }
  const parser = markdownit(config)
  const plugins = md.plugins || {}

  Object.keys(plugins).forEach(plugin => {
    Array.isArray(plugins[plugin])
      ? parser.use.apply(parser, plugins[plugin])
      : parser.use(plugins[plugin])
  })

  if (typeof md.customize === 'function') {
    md.customize(parser)
  }
  return parser
}
export default class NuxtentConfig {
  constructor(moduleOptions = {}, options) {
    this.host = options.host || process.env.HOST || 'localhost'
    this.port = options.port || process.env.PORT || '3000'
    process.env.NUXTENT_HOST = this.host
    process.env.NUXTENT_PORT = this.port
    this._rawOptions = Object.assign({}, moduleOptions, options.nuxtent)
    /**
     * @const {String} _publicPath The public url path
     */
    this._publicPath = options.build.publicPath || '/_nuxt'

    this._defaultMarkdown = {
      plugins: {},
      highlight: null,
      use: []
    }

    this._defaultToc = [
      {
        level: 2,
        permalink: true,
        permalinkClass: 'nuxtent-toc',
        permalinkSymbol: '🔗',
        slugify: slugify
      }
    ]

    this._defaultApi = {
      host: this.host,
      port: this.port,
      baseURL: `http://${this.host}:${this.port}`,
      browserBaseURL: '',
      apiServerPrefix: '/content-api',
      apiBrowserPrefix: this._publicPath + 'content'
    }

    this._defaultContent = {
      isPost: false,
      data: false,
      breadcrumbs: false,
      toc: { ...this._defaultToc },
      page: null,
      permalink: ':slug',
      generate: ['get', 'getAll'],
      markdown: { ...this._defaultMarkdown }
    }

    this._defaultBuild = {
      contentDirWebpackAlias: '~/components',
      contentDir: join(options.srcDir, 'content'),
      componentsDir: join(options.srcDir, 'components'),
      buildDir: 'content',
      loaderComponentExtensions: ['.vue', '.js']
    }
  }

  get config() {
    return {
      content: this.content,
      api: this.api,
      build: this.build
    }
  }

  get content() {
    return this.formatContentOptions(this.rawContent)
  }

  set content(content) {
    this.rawContent = merge(this._defaultContent, content)
  }

  async init(rootDir) {
    const userConfig = await this.loadNuxtentConfig(rootDir)
    this._userConfig = userConfig
    this.rawContent = merge(
      this._defaultContent,
      this._rawOptions.content,
      this._userConfig.content
    )
    this.api = merge(
      this._defaultApi,
      this._rawOptions.api,
      this._userConfig.api
    )
    this.build = merge(
      this._defaultBuild,
      this._rawOptions.build,
      this._userConfig.build
    )
    this.markdown = merge(
      this._defaultMarkdown,
      this._rawOptions.markdown,
      this._userConfig.markdown
    )
    this.toc = merge(
      this._defaultToc,
      this._rawOptions.toc,
      this._userConfig.toc
    )

    logger.debug('Config finished', JSON.stringify(this, ' ', 1))
  }

  /**
   * Load the nuxtent config file
   * @param {String} rootDir The root of the proyect
   */
  async loadNuxtentConfig(rootDir) {
    const rootConfig = join(rootDir, 'nuxtent.config.js')
    try {
      const configModule = await import(rootConfig)
      console.log(configModule)
      return configModule.default ? configModule.default : configModule
    } catch (err) {
      if (
        err.code === 'MODULE_NOT_FOUND' &&
        err.message.includes('nuxtent.config.js')
      ) {
        logger.warn('nuxtent.config.js not found, fallingback to defaults')
        return false
      }
      throw new Error(`[Invalid nuxtent configuration] ${err}`)
    }
  }

  setTocOptions(dirOpts = {}) {
    if (typeof dirOpts.toc === 'number') {
      dirOpts.markdown.plugins['toc'] = [
        anchors,
        {
          ...this._defaultToc,
          ...{ level: dirOpts.toc }
        }
      ]
    } else if (typeof dirOpts.toc === 'object') {
      dirOpts.markdown.plugins['toc'] = [
        anchors,
        { ...this._defaultToc, ...dirOpts.toc }
      ]
    } else if (dirOpts.toc === true) {
      dirOpts.markdown.plugins['toc'] = [anchors, this._defaultToc]
    }
  }

  /**
   * @param {(Array|Object)} content
   * @param {Object} defaults
   * @returns {NuxtentContentGroup{}} Content config
   */
  formatContentOptions(content) {
    const opts = {}
    // Single type content
    if (!Array.isArray(content)) {
      this.setTocOptions(content)
      opts['/'] = merge({}, this._defaultContent, content)
      opts['/'].parser = {
        config: opts['/'].markdown,
        instance: markdownParser
      }
    } else {
      // Multiple type content
      content.forEach(entry => {
        const entryIsArray = Array.isArray(entry)
        if (!entryIsArray && typeof entry !== 'string') {
          throw new Error('Each entry should be an array or a string')
        }
        const dirName = entryIsArray ? entry[0] : entry
        const dirOpts = entryIsArray ? entry[1] : {}
        if (dirName === '/' && content.length > 1) {
          // prevent endpoint conflict
          throw new Error(
            'Top level files not allowed with nested registered directories'
          )
        }
        const key = new URL('/', dirName)
        this.setTocOptions(dirOpts)
        opts[key] = merge({}, this._defaultContent, dirOpts)
        opts[key].parser = {
          config: opts[key].markdown,
          instance: markdownParser
        }
      })
    }
    return opts
  }
}
