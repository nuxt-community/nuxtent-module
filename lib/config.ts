import { join } from 'path'
import markdownItAnchor from 'markdown-it-anchor'
import { merge } from 'lodash'
import MarkdownIt from 'markdown-it'
import { pathToName, slugify, logger } from './utils'
import Database from './content/database'
import { INuxtent } from '../types'
import NuxtConfiguration, { Router, Module as ModuleConfig } from '@nuxt/config'
import { RouteConfig, Route } from 'vue-router'
import markdwonToc from 'markdown-it-toc-done-right'
const createParser = (markdownConfig: INuxtent.ConfigMarkdown) => {
  const config = markdownConfig.settings
  if (typeof markdownConfig.extend === 'function') {
    markdownConfig.extend(config)
  }
  const parser = new MarkdownIt(config)
  const plugins = markdownConfig.plugins || {}

  // Object.keys(plugins).forEach(plugin => {
  //   Array.isArray(plugins[plugin])
  //     ? parser.use.apply(parser, plugins[plugin])
  //     : parser.use(plugins[plugin])
  // })

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

  public content: INuxtent.ContentArray

  public api: INuxtent.ConfigApi

  public build: INuxtent.ConfigBuild

  public markdown: INuxtent.ConfigMarkdown

  public toc: INuxtent.ConfigToc

  public routePaths: INuxtent.RoutePaths = new Map()

  public assetMap: INuxtent.AssetMap = new Map()

  public database: Map<string, Database>

  /**
   * @description An array of the static pages to render during generate
   * @type {String[]} The routes of the pages to render
   *
   */
  public staticRoutes: string[] = []

  /**
   * @description Is a static (--generate) build
   * @type {boolean}
   *
   */
  public isStatic: boolean = false

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

  protected defaultBuild: INuxtent.ConfigBuild = {
    buildDir: 'content',
    componentsDir: 'components',
    contentDir: 'content',
    contentDirWebpackAlias: '~/components',
    ignorePrefix: '-',
    loaderComponentExtensions: ['.vue', '.js', '.mjs'],
  }

  protected defaultApi: INuxtent.ConfigApi = {
    apiBrowserPrefix: this.publicPath + this.defaultBuild.buildDir,
    apiServerPrefix: '/content-api',
    baseURL: `http://${this.host}:${this.port}`,
    browserBaseURL: '',
    host: this.host,
    port: this.port,
  }

  /**
   * @description The default container struture for content collections
   *
   * @memberOf NuxtentConfig
   */
  protected defaultContentContainer: INuxtent.ContentArray = [
    ['/', { ...this.defaultContent }],
  ]

  private userConfig: INuxtent.ConfigUser = {
    api: { ...this.defaultApi },
    build: { ...this.defaultBuild },
    content: { ...this.defaultContentContainer },
    markdown: { ...this.defaultMarkdown },
    toc: { ...this.defaultToc },
  }

  /**
   * Creates an instance of NuxtentConfig.
   * @param {Object} [moduleOptions={}] The module of the config found on nuxt.config.js
   * @param {Object} options The nuxt options found on ModuleContainer.options
   *
   * @memberOf NuxtentConfig
   */
  constructor(moduleOptions: ModuleConfig, options: NuxtConfiguration) {
    this.host = options.host || this.host
    this.port = options.port || this.port
    process.env.NUXTENT_HOST = this.host
    process.env.NUXTENT_PORT = this.port
    this.api = { ...this.defaultApi }
    this.build = { ...this.defaultBuild }
    this.markdown = { ...this.defaultMarkdown }
    this.toc = { ...this.defaultToc }
    this.content = { ...this.defaultContentContainer }
    merge(this.userConfig, moduleOptions, options.nuxtent)
    if (options.build) {
      this.publicPath = options.build.publicPath || this.publicPath
    }
    const srcDir = options.srcDir || '~/'
    this.build.contentDir = join(srcDir, 'content')
    this.build.componentsDir = join(srcDir, 'components')
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
      api: this.api,
      build: this.build,
      content: this.content,
      markdown: this.markdown,
      toc: this.toc,
    }
  }

  public async init(rootDir = '~/'): Promise<NuxtentConfig> {
    const userConfig = await this.loadNuxtentConfig(rootDir)
    merge(this.userConfig, userConfig)
    if (!Array.isArray(this.userConfig.content)) {
      this.userConfig.content = [
        ['/', { ...this.defaultContent, ...this.userConfig.content }],
      ]
    }
    this.api = merge({}, this.defaultApi, this.userConfig.api)
    this.build = merge({}, this.defaultBuild, this.userConfig.build)
    this.markdown = merge({}, this.defaultMarkdown, this.userConfig.markdown)
    this.toc = merge({}, this.defaultToc, this.userConfig.toc)
    this.content = this.userConfig.content
    this.buildContent()

    // @ts-ignore
    logger.debug(this, 'Config finished')
    return this
  }

  /**
   * Load the nuxtent config file
   * @param {String} rootDir The root of the proyect
   */
  public async loadNuxtentConfig(
    rootDir: string
  ): Promise<INuxtent.ConfigUser> {
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
   * @param dirOpts The content definition
   * @returns The content with the toc formatted and the plugin inserted
   */
  public setTocOptions(
    dirOpts: INuxtent.ConfigContent = this.defaultContent
  ): INuxtent.ConfigContent {
    // End early if is falsey
    if (!dirOpts.toc) {
      dirOpts.toc = false
      return dirOpts
    }
    // Local var to set the config
    const tocConfig = this.defaultToc
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
      markdwonToc,
      {
        containerClass: 'nuxtent-toc',
        slugify,
      },
    ]
    return dirOpts
  }

  public buildContent() {
    this.content.forEach(([, content]) => {
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

  public interceptRoutes(moduleContianer: Router): void {
    const renameRoutePath = (route: Route): Route => {
      if (!route.name) {
        return route
      }
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
      }
      //  else if (route.children) {
      //   route.children.forEach(renameRoutePath)
      // }
      return route
    }
    if (typeof moduleContianer.extendRoutes !== 'function') {
      throw new Error('There is no "extendRoutes"')
    }
    moduleContianer.extendRoutes = (routes: Route[], resolve) => {
      console.log(routes, resolve)
      return routes.map(renameRoutePath)
    }
  }

  public createContentDatabase() {
    const database: Map<string, Database> = new Map()
    this.content.forEach(([dirName, content]) => {
      const db = new Database(this.build, dirName, content)
      database.set(dirName, db)
    })
    this.database = database
    return database
  }
}
