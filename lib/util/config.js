import { join } from 'path'

import markdownItAnchor from 'markdown-it-anchor'
import { merge } from 'lodash'

import MarkdownIt from 'markdown-it'

import slugify from './slugify'

import logger from './debug'
const createParser = markdownConfig => {
  const config = markdownConfig.settings
  if (typeof markdownConfig.extend === 'function') {
    markdownConfig.extend(config)
  }
  const parser = new MarkdownIt(config)
  const plugins = markdownConfig.plugins || {}

  Object.keys(plugins).forEach(plugin => {
    Array.isArray(plugins[plugin])
      ? parser.use.apply(parser, plugins[plugin])
      : parser.use(plugins[plugin])
  })

  if (typeof markdownConfig.customize === 'function') {
    markdownConfig.customize(parser)
  }
  return parser
}
/**
 * @description The config
 *
 * @export
 * @class NuxtentConfig
 */
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
      use: [],
      extend: undefined,
      settings: {
        highlight: null,
        preset: 'default',
        html: true,
        typographer: true,
        linkify: true
      },
      parser: null
    }
    this._defaultToc = {
      level: 2,
      permalink: true,
      permalinkClass: 'nuxtent-toc',
      permalinkSymbol: '🔗',
      slugify: slugify
    }

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
      build: this.build,
      markdown: this.markdown,
      toc: this.toc
    }
  }

  async init(rootDir) {
    const userConfig = await this.loadNuxtentConfig(rootDir)
    this._userConfig = userConfig
    this.rawContent = merge(
      [],
      this._defaultContent,
      this._rawOptions.content,
      this._userConfig.content
    )
    this.api = merge(
      {},
      this._defaultApi,
      this._rawOptions.api,
      this._userConfig.api
    )
    this.build = merge(
      {},
      this._defaultBuild,
      this._rawOptions.build,
      this._userConfig.build
    )
    this.markdown = merge(
      {},
      this._defaultMarkdown,
      this._rawOptions.markdown,
      this._userConfig.markdown
    )
    this.toc = merge(
      {},
      this._defaultToc,
      this._rawOptions.toc,
      this._userConfig.toc
    )
    this.content = this.formatContentOptions(this.rawContent)

    // logger.debug('Config finished', JSON.stringify(this, ' ', 1))
  }

  /**
   * Load the nuxtent config file
   * @param {String} rootDir The root of the proyect
   */
  async loadNuxtentConfig(rootDir) {
    const rootConfig = join(rootDir, 'nuxtent.config.js')
    try {
      const configModule = await import(rootConfig)
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
      dirOpts.markdown.plugins.toc = [
        markdownItAnchor,
        merge({}, this._defaultToc, { level: dirOpts.toc })
      ]
    } else if (typeof dirOpts.toc === 'object') {
      dirOpts.markdown.plugins.toc = [
        markdownItAnchor,
        merge({}, this._defaultToc, dirOpts.toc)
      ]
    } else if (dirOpts.toc === true) {
      dirOpts.markdown.plugins.toc = [markdownItAnchor, this._defaultToc]
    }
  }

  /**
   * @param {(Array|Object)} content
   * @param {Object} defaults
   * @returns {NuxtentContentGroup{}} Content config
   */
  formatContentOptions(content) {
    const opts = {}
    const setContent = (key, dirOpts) => {
      opts[key] = merge({}, this._defaultContent, dirOpts)
      this.setTocOptions(opts[key])
      opts[key].markdown = merge(
        {},
        this._defaultMarkdown,
        this.markdown,
        opts[key].markdown
      )
      opts[key].parser = createParser(opts[key].markdown)
    }
    // Single type content
    if (!Array.isArray(content)) {
      setContent('/', content)
      return opts
    }
    // Multiple type content
    content.forEach(entry => {
      if (!Array.isArray(entry)) {
        if (typeof entry !== 'string') {
          throw new Error('Each entry should be an array or a string')
        }
        entry = [entry]
      }
      const [dirName, dirOpts = {}] = entry
      if (dirName === '/' && content.length > 1) {
        // prevent endpoint conflict
        throw new Error(
          'Top level files not allowed with nested registered directories'
        )
      }
      const key = `/${dirName}`
      setContent(key, dirOpts)
    })

    return opts
  }
}
