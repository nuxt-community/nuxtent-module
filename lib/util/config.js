import { join } from 'path'
import markdownItAnchor from 'markdown-it-anchor'
import { merge } from 'lodash'
import MarkdownIt from 'markdown-it'
import markdownItTocDoneRight from 'markdown-it-toc-done-right'

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
 * @description Nuxtent Config Module
 *
 * @export
 * @class NuxtentConfig
 */
export default class NuxtentConfig {
  /**
   * @description The hostname to use the server
   * @type {String}
   * @memberOf NuxtentConfig
   */
  host = process.env.NUXTENT_HOST || process.env.HOST || 'localhost'
  /**
   * @description The port to use
   * @type {String}
   * @memberOf NuxtentConfig
   */
  port = process.env.NUXTENT_PORT || process.env.PORT || '3000'

  /**
   * @description The nuxt publicPath
   * @const {String}
   * @private
   *
   * @memberOf NuxtentConfig
   */
  _publicPath = '/_nuxt/'

  /**
   * @description The default markdown-it settings, used internaly
   * @private
   * @typedef {Object} markdownSettings markdown-it Settings for nuxtent
   * @property {?Function} highlight A function to highlight code
   * @property {string} preset The markdown-it preset
   * @property {boolean} html allow or not html tags inside markdown
   * @property {boolean} typographer Convert quotes into typographic quotes
   * @property {boolean} linkify Convert text url's into anchors
   */

  /**
   * @type {markdownSettings}
   * @memberOf NuxtentConfig
   */
  _markdownSettings = {
    highlight: null,
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true
  }

  /**
   * @description The full markdown configuration for nuxtent
   * @typedef {Object} NuxtentConfigMarkdown
   * @property {Object.<string, array|module>} plugins The plugins to use on markdown,
   * must be a object where key is the name of the plugin and the value an array
   * or the plugin instance
   * // { pluginName: [pluginModule, config] }
   * @property {Array.<array | module>} use Raw plugin for markdownit
   * @property {?Function} extend A function where you have access to the full
   * markdown-it config as first param and you can modify it
   * @property {?function} parser The private parser instance
   * @property {?function} customize A function where you have access to the markdown-it
   * instance as a first paramaeter
   * @property {markdownSettings} settings The markdown Settings
   */

  /**
   * @type {NuxtentConfigMarkdown}
   * @memberOf NuxtentConfig
   */
  _defaultMarkdown = {
    plugins: {},
    use: [],
    extend: null,
    parser: null,
    customize: null,
    settings: { ...this._markdownSettings }
  }
  /**
   * @typedef {Object} NuxtentConfigToc  The default toc configuration
   * @property {number} level The depth level to mark anchors
   * @property {boolean} permalink Attach permalink or not
   * @property {string} permalinkClass The class to add to the permalink
   * @property {string} permalinkSymbol The symbol to use as a permalink
   * @property {function} slugify The function to slugify the permalink
   *
   */

  /**
    * @type {NuxtentConfigToc}
    * @memberOf NuxtentConfig
    */
  _defaultToc = {
    level: 2,
    permalink: true,
    permalinkClass: 'nuxtent-anchor',
    permalinkSymbol: '🔗',
    slugify: slugify
  }

  /**
   * @typedef {Object} NuxtentConfigContent Default single content container config
   * @property {boolean} isPost Wheather treat this container content as blog like post or not
   * @property {?Object} data The data to pass as default frontmatter info and injected into async components
   * @property {boolean} breadcrumbs Generate breadcrumbs for nested content
   * @property {?NuxtentConfigToc|Number|boolean} toc The toc configuration for this container
   * @property {String} page The vue file where the content will be used, is necesary to rewrite the route for post mode
   * @property {string} permalink The route that will generate the permalink,
   * you can define something like `/:year/:slug` for post files
   * @property {Array.<string>} [generate=['getAll', 'getOnly', 'get']] The query methods to generate
   * @property {NuxtentConfigMarkdown} markdown The specific markdown configuration for this container
   * @memberOf NuxtentConfig
   */

  /**
    * @type {NuxtentConfigContent}
    * @memberOf NuxtentConfig
    */
  _defaultContent = {
    isPost: false,
    data: null,
    breadcrumbs: false,
    toc: { ...this._defaultToc },
    page: null,
    permalink: ':slug',
    generate: ['getAll', 'getOnly', 'get'],
    markdown: { ...this._defaultMarkdown }
  }

  /**
   * @typedef {Object} NuxtentConfigBuild The build configuration
   * @property {string} contentDirWebpackAlias The alias used by webpack for the components folder
   * @property {string} contentDir The path for the content directory
   * @property {string} componentsDir The path where the components are located
   * @property {string} buildDir The folder output when generating
   * @property {Array.<string>} loaderComponentExtensions The extensions for the vue sfc inside component directory
   */

  /**
    * @type {NuxtentConfigBuild}
    * @memberOf NuxtentConfig
    */
  _defaultBuild = {
    contentDirWebpackAlias: '~/components',
    contentDir: join(__dirname, 'content'),
    componentsDir: join(__dirname, 'components'),
    buildDir: 'content',
    loaderComponentExtensions: ['.vue', '.js', '.mjs']
  }

  /**
   * @typedef {Object} NuxtentConfigApi
   * @description The api configuration for nuxtent
   * @property {string} host The host to use for generate and ssr requests
   * @property {string} port The port to use for generate and ssr requests
   * @property {string} baseURL The url for ssr requests
   * // `http://${this.host}:${this.port}`
   * @property {string} browserBaseURL The borswer domain or base, usefull for cdn setups
   * @property {string} apiServerPrefix The prefix to serve the api with ssr
   * @property {string} apiBrowserPrefix The prefix for static or spa sites
   * // '/._nuxt/content
   */

  /**
    * @type {NuxtentConfigApi}
    * @memberOf NuxtentConfig
    */
   _defaultApi = {
     host: this.host,
     port: this.port,
     baseURL: `http://${this.host}:${this.port}`,
     browserBaseURL: '',
     apiServerPrefix: '/content-api',
     apiBrowserPrefix: this._publicPath + this._defaultBuild.buildDir
   }

  /**
   * @description The raw content array
   *
   *
   * @memberOf NuxtentConfig
   */
  rawContent = null

  /**
   * @typedef {[string, NuxtentConfigContent][]} NuxtentConfigContentContainer
   */
  /**
   * @type {NuxtentConfigContentContainer}
   *
   * @memberOf NuxtentConfig
   */
   _defaultContentContainer = [['/', { ...this._defaultContent }]]
   /**
    * @typedef {Object} NuxtentConfigUser The user config
    * @property {NuxtentConfigContent | NuxtentConfigContentContainer} content The content definition
    * @property {NuxtentConfigApi} api The api definition
    * @property {NuxtentConfigBuild} build The build definition
    * @property {NuxtentConfigMarkdown} markdown the markdown definition
    * @property {NuxtentConfigToc} toc The toc definition
    */

   /**
     * @type {NuxtentConfigUser}
     * @memberOf NuxtentConfig
     */
   _userConfig = {
     content: this._defaultContentContainer,
     api: this._defaultApi,
     build: this._defaultBuild,
     markdown: this._defaultMarkdown,
     toc: { ...this._defaultToc }
   }

  content = null
  /**
   * @description The api config
   * @type {NuxtentConfigApi}
   * @memberOf NuxtentConfig
   */
  api = { ...this._defaultApi }
  /**
   * @description The api config
   * @type {NuxtentConfigApi}
   * @memberOf NuxtentConfig
   */
  build = { ...this._defaultBuild }
  markdown = { ...this._defaultMarkdown }
  toc = { ...this._defaultToc }

  constructor (moduleOptions = {}, options) {
    this.host = options.host || this.host
    this.port = options.port || this.port
    process.env.NUXTENT_HOST = this.host
    process.env.NUXTENT_PORT = this.port
    merge(this._userConfig, moduleOptions, options.nuxtent)
    this._publicPath = options.build.publicPath || this._publicPath
    this._defaultBuild.contentDir = join(options.srcDir, 'content')
    this._defaultBuild.componentsDir = join(options.srcDir, 'components')
  }

  get config () {
    return {
      content: this.content,
      api: this.api,
      build: this.build,
      markdown: this.markdown,
      toc: this.toc
    }
  }

  async init (rootDir) {
    const userConfig = await this.loadNuxtentConfig(rootDir)
    merge(this._userConfig, userConfig)
    if (!Array.isArray(this._userConfig.content)) {
      logger.debug('Formating content', this._userConfig.content)
      this._userConfig.content = [['/', { ...this._defaultContent, ...this._userConfig.content }]]
    }
    this.rawContent = this._userConfig.content
    this.api = merge({},
      this._defaultApi,
      this._userConfig.api
    )
    this.build = merge({},
      this._defaultBuild,
      this._userConfig.build
    )
    this.markdown = merge({},
      this._defaultMarkdown,
      this._userConfig.markdown
    )
    this.toc = merge({},
      this._defaultToc,
      this._userConfig.toc
    )
    this.content = this.formatContentOptions(this.rawContent)

    logger.debug('Config finished')
    logger.debug(this.config)
  }

  /**
   * Load the nuxtent config file
   * @param {String} rootDir The root of the proyect
   * @returns {Promise.<NuxtentConfigUser>} The nuxtent user config
   */
  async loadNuxtentConfig(rootDir) {
    const rootConfig = join(rootDir, 'nuxtent.config.js')
    try {
      const configModule = await import(rootConfig)
      return configModule.default ? configModule.default : configModule
    } catch (error) {
      if (
        error.code === 'MODULE_NOT_FOUND' &&
        error.message.includes('nuxtent.config.js')
      ) {
        logger.warn('nuxtent.config.js not found, fallingback to defaults')
        return this._userConfig
      }
      throw new Error(`[Invalid nuxtent configuration] ${error}`)
    }
  }

  /**
   * Formats the toc options
   * @param {NuxtentConfigContent} dirOpts The content definition
   * @returns {NuxtentConfigContent} The content with the toc formatted and the plugin inserted
   */
  setTocOptions (dirOpts = this._defaultContent) {
    let tocConfig = this._defaultToc
    if (typeof dirOpts.toc === 'number') {
      merge(tocConfig, {
        level: dirOpts.toc
      })
      dirOpts.markdown.plugins.toc = [
        markdownItAnchor,
        tocConfig
      ]
      dirOpts.toc = tocConfig
    } else if (typeof dirOpts.toc === 'object') {
      merge(tocConfig, dirOpts.toc)
      dirOpts.markdown.plugins.toc = [
        markdownItAnchor,
        tocConfig
      ]
      dirOpts.markdown.plugins.tocDoneRight = [
        markdownItTocDoneRight,
        {
          slugify: slugify,
          containerClass: 'nuxtent-toc'
        }
      ]
      dirOpts.toc = tocConfig
    } else if (dirOpts.toc === true) {
      dirOpts.markdown.plugins.toc = [markdownItAnchor, tocConfig]
      dirOpts.toc = tocConfig
    }
    return dirOpts
  }

  /**
   * @param {NuxtentConfigContentContainer} content The content container from the user
   * @returns {object} Content config
   */
  formatContentOptions (content) {
    // Single type content
    if (!Array.isArray(content)) {
      throw new TypeError('Content is malformed')
    }
    // Multiple type content
    return content.reduce((collection, [dirName, dirOpts]) => {
      if (dirName === '/' && content.length > 1) {
        // prevent endpoint conflict
        throw new Error('Top level files not allowed with nested directories')
      }
      const key = `/${dirName}`
      collection[key] = merge({}, this._defaultContent, dirOpts)
      collection[key].toc = this.setTocOptions(collection[key])
      collection[key].markdown = merge({},
        this._defaultMarkdown,
        this.markdown,
        collection[key].markdown
      )
      collection[key].parser = createParser(collection[key].markdown)
      return collection
    }, {})
  }
}
