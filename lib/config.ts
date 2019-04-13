import { join } from 'path'
import markdownItAnchor from 'markdown-it-anchor'
import { merge } from 'lodash'
import MarkdownIt from 'markdown-it'
import markdownItTocDoneRight from '../types/markdown-it-toc-done-right'
import { pathToName, slugify, logger } from './utils'
import Database from './content/database'
import { INuxtent } from '../types'

const createParser = (markdownConfig: INuxtent.ConfigMarkdown) => {
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
export default class NuxtentConfig implements INuxtent.Config {
  /**
   * @description The hostname to use the server
   * @type {String}
   * @memberOf NuxtentConfig
   */
  public host: string =
    process.env.NUXTENT_HOST || process.env.HOST || 'localhost'
  /**
   * @description The port to use
   * @type {String}
   * @memberOf NuxtentConfig
   */
  public port: string = process.env.NUXTENT_PORT || process.env.PORT || '3000'

  /**
   * @description The nuxt publicPath
   * @const {String}
   * @private
   *
   * @memberOf NuxtentConfig
   */
  public publicPath = '/_nuxt/'

  public markdownSettings: INuxtent.MarkdownSettings = {
    html: true,
    linkify: true,
    preset: 'default',
    typographer: true,
  }

  public defaultMarkdown: INuxtent.ConfigMarkdown = {
    customize: undefined,
    parser: undefined,
    plugins: {},
    settings: { ...this.markdownSettings },
    use: [],
  }

  public defaultToc: INuxtent.ConfigToc = {
    level: 2,
    permalink: true,
    permalinkClass: 'nuxtent-anchor',
    permalinkSymbol: '🔗',
    slugify,
  }

  /**
   * @description
   * @type {NuxtentConfigContentGenereate}
   *
   * @memberOf NuxtentConfig
   */
  public requestMethods: INuxtent.RequestMethods[] = [
    'getOnly',
    'get',
    ['getAll', { query: { exclude: 'body' } }],
  ]

  public content: { [dirName: string]: INuxtent.ConfigContent } = {}

  public api: INuxtent.ApiConfig = { ...this.defaultApi }

  public build: INuxtent.BuildConfig = { ...this.defaultBuild }

  public markdown: INuxtent.ConfigMarkdown = { ...this.defaultMarkdown }

  /**
   * @type {NuxtentConfigContent}
   * @memberOf NuxtentConfig
   */
  protected defaultContent: INuxtent.ConfigContent = {
    breadcrumbs: false,
    data: undefined,
    isPost: false,
    markdown: { ...this.defaultMarkdown },
    method: [...this.requestMethods],
    page: '',
    parser: undefined,
    permalink: ':slug',
    toc: { ...this.defaultToc },
  }

  protected defaultBuild: INuxtent.BuildConfig = {
    buildDir: 'content',
    componentsDir: 'components',
    contentDir: 'content',
    contentDirWebpackAlias: '~/components',
    ignorePrefix: '-',
    loaderComponentExtensions: ['.vue', '.js', '.mjs'],
  }

  protected defaultApi: INuxtent.ApiConfig = {
    apiBrowserPrefix: this.publicPath + this.defaultBuild.buildDir,
    apiServerPrefix: '/content-api',
    baseURL: `http://${this.host}:${this.port}`,
    browserBaseURL: '',
    host: this.host,
    port: this.port,
  }

  protected rawContent: [] = []

  /**
   * @description The default container struture for content collections
   *
   * @memberOf NuxtentConfig
   */
  protected defaultContentContainer = [['/', { ...this.defaultContent }]]

  private userConfig = {
    api: { ...this.defaultApi },
    build: { ...this.defaultBuild },
    content: { ...this.defaultContentContainer },
    markdown: { ...this.defaultMarkdown },
    toc: { ...this.defaultToc },
  }

  /**
   * @description The global toc configuration
   * @type {NuxtentConfigToc}
   *
   * @memberOf NuxtentConfig
   */
  toc: NuxtentConfigToc = { ...this.defaultToc }

  /**
   * @description An array of the static pages to render during generate
   * @type {String[]} The routes of the pages to render
   *
   * @memberOf NuxtentConfig
   */
  staticRoutes: string[] = []

  /**
   * @description Is a static (generated) build
   * @type {boolean}
   *
   * @memberOf NuxtentConfig
   */
  isStatic: boolean = false

  /**
   * Creates an instance of NuxtentConfig.
   * @param {Object} [moduleOptions={}] The module of the config found on nuxt.config.js
   * @param {Object} options The nuxt options found on ModuleContainer.options
   *
   * @memberOf NuxtentConfig
   */
  constructor(moduleOptions: object = {}, options: object) {
    this.host = options.host || this.host
    this.port = options.port || this.port
    process.env.NUXTENT_HOST = this.host
    process.env.NUXTENT_PORT = this.port
    merge(this.userConfig, moduleOptions, options.nuxtent)
    this.publicPath = options.build.publicPath || this.publicPath
    this.build.contentDir = join(options.srcDir, 'content')
    this.build.componentsDir = join(options.srcDir, 'components')
  }

  /**
   * @description The public config object
   *
   * @readonly
   *
   * @memberOf NuxtentConfig
   */
  get config() {
    return {
      content: this.content,
      api: this.api,
      build: this.build,
      markdown: this.markdown,
      toc: this.toc,
    }
  }

  /**
   * Loads the user configuration and parses the content modules
   * @param {string} rootDir The proyect's root directory
   * @returns {Promise.<NuxtentConfig>} this
   */
  async init(rootDir: string): Promise<NuxtentConfig> {
    const userConfig = await this.loadNuxtentConfig(rootDir)
    merge(this.userConfig, userConfig)
    if (!Array.isArray(this.userConfig.content)) {
      this.userConfig.content = [
        ['/', { ...this.defaultContent, ...this.userConfig.content }],
      ]
    }
    this.rawContent = this.userConfig.content
    this.api = merge({}, this.defaultApi, this.userConfig.api)
    this.build = merge({}, this.defaultBuild, this.userConfig.build)
    this.markdown = merge({}, this.defaultMarkdown, this.userConfig.markdown)
    this.toc = merge({}, this.defaultToc, this.userConfig.toc)
    this.content = this.formatContentOptions()
    this.buildContent()

    // @ts-ignore
    logger.debug(this, 'Config finished')
    return this
  }

  /**
   * Load the nuxtent config file
   * @param {String} rootDir The root of the proyect
   * @returns {Promise.<NuxtentConfigUser>} The nuxtent user config
   */
  async loadNuxtentConfig(rootDir: string): Promise<NuxtentConfigUser> {
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
        return this.userConfig
      }
      throw new Error(`[Invalid nuxtent configuration] ${error}`)
    }
  }

  /**
   * Formats the toc options
   * @param {NuxtentConfigContent} dirOpts The content definition
   * @returns {NuxtentConfigContent} The content with the toc formatted and the plugin inserted
   */
  setTocOptions(
    dirOpts: NuxtentConfigContent = this.defaultContent
  ): NuxtentConfigContent {
    // End early if is falsey
    if (!dirOpts.toc) {
      dirOpts.toc = false
      return dirOpts
    }
    // Local var to set the config
    let tocConfig = this.defaultToc
    if (typeof dirOpts.toc === 'number') {
      merge(tocConfig, {
        level: dirOpts.toc,
      })
    } else if (typeof dirOpts.toc === 'object') {
      merge(tocConfig, dirOpts.toc)
    } else {
      dirOpts.toc = tocConfig
    }
    // Setting toc
    dirOpts.toc = tocConfig
    dirOpts.markdown.plugins.toc = [markdownItAnchor, tocConfig]
    dirOpts.markdown.plugins.markdownItTocDoneRight = [
      markdownItTocDoneRight,
      {
        slugify: slugify,
        containerClass: 'nuxtent-toc',
      },
    ]
    return dirOpts
  }

  /**
   * Formats the content into an object
   * @returns {object} Content config
   */
  formatContentOptions(): object {
    // Single type content
    if (!Array.isArray(this.rawContent)) {
      throw new TypeError('Content is malformed')
    }
    // Multiple type content
    return this.rawContent.reduce(
      /**
       * Maps
       * @param {Object.<string, NuxtentConfigContent>} collection The collection
       * @param {[string, NuxtentConfigContent]} contentGroup THe content config
       * @returns {Object} alo
       */
      (
        collection: { [s: string]: NuxtentConfigContent },
        [dirName, dirOpts]: [string, NuxtentConfigContent]
      ): object => {
        if (dirName === '/' && this.rawContent.length > 1) {
          // prevent endpoint conflict
          throw new Error('Top level files not allowed with nested directories')
        }
        const key = `/${dirName}`
        collection[key] = merge({}, this.defaultContent, dirOpts)
        collection[key].markdown = merge(
          {},
          this.defaultMarkdown,
          this.markdown,
          collection[key].markdown
        )
        collection[key] = this.setTocOptions(collection[key])
        collection[key].parser = createParser(collection[key].markdown)
        return collection
      },
      {}
    )
  }

  /**
   * @type {NuxtentRoutePaths}
   * @description paths to reconfigure
   */
  routePaths: NuxtentRoutePaths = new Map()
  /** @type {Map.<string, string>} */
  assetMap: Map<string, string> = new Map()
  buildContent() {
    this.rawContent.forEach(([, content]) => {
      const { page, permalink } = content
      if (page) {
        this.routePaths.set(pathToName(page), permalink.replace(/^\//, ''))
      }
    })
  }

  /**
   * Intercept the nuxt routes and map them to nuxtent, usefull for date routes
   * @param {*} moduleContianer - A map with all the routes
   * @returns {void}
   */

  interceptRoutes(moduleContianer: any): void {
    /**
     * Renames child routes
     * @param {NuxtRoute} route The route
     * @returns {void}
     */
    const renameRoutePath = (route: NuxtRoute): void => {
      let overwritedPath = this.routePaths.get(route.name)
      if (overwritedPath !== undefined) {
        const isOptional = route.path.match(/\?$/)
        const match = overwritedPath.match(/\/(.*)/)
        if (match) {
          overwritedPath = match[1]
        }
        logger.debug(
          `Renamed ${route.name} path ${route.path} > ${overwritedPath}`
        )
        route.path = isOptional ? overwritedPath + '?' : overwritedPath
      } else if (route.children) {
        route.children.forEach(renameRoutePath)
      }
    }
    return moduleContianer.extendRoutes(
      (
        /**
         * @param {[NuxtRoute]} routes An array with the routes
         * @returns {void}
         */
        routes: [NuxtRoute]
      ): void => routes.forEach(renameRoutePath)
    )
  }

  createContentDatabase() {
    /** @type {Map.<string, Database>} */
    const database: Map<string, Database> = new Map()
    this.rawContent.forEach(([dirName, content]) => {
      const db = new Database(this.build, dirName, content)
      database.set(dirName, db)
    })
    this.database = database
    return database
  }
}
