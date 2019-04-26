import { join } from 'path'
import markdownItAnchor from 'markdown-it-anchor'
import { defaultsDeep } from 'lodash'
import { pathToName, slugify, logger } from './utils'
import Database from './content/database'
import { Nuxtent } from '../types'
import { RouteConfig, Route } from 'vue-router'
import markdownIt from 'markdown-it'
import markdownItTocDoneRight from 'markdown-it-toc-done-right'
import { Nuxt } from '../types/nuxt'
const createParser = (markdownConfig: Nuxtent.Config.Markdown) => {
  const config = markdownConfig.settings
  if (typeof markdownConfig.extend === 'function') {
    markdownConfig.extend(config)
  }

  const parser = markdownIt(config)
  const plugins = markdownConfig.plugins || {}

  Object.keys(plugins).forEach(plugin => {
    Array.isArray(plugins[plugin])
      ? parser.use.apply(parser, plugins[
          plugin
        ] as Nuxtent.Config.MarkdownItPluginArray)
      : parser.use(plugins[plugin] as Nuxtent.Config.MarkdownItPlugin)
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
export default class NuxtentConfig implements Nuxtent.Config.Config {
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

  public markdownSettings: Nuxtent.Config.MarkdownSettings = {
    html: true,
    linkify: true,
    preset: 'default',
    typographer: true,
  }

  public defaultMarkdown: Nuxtent.Config.Markdown = {
    customize: undefined,
    parser: undefined,
    plugins: {},
    settings: { ...this.markdownSettings },
    use: [],
  }

  public defaultToc: Nuxtent.Config.Toc = {
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
  public requestMethods: Nuxtent.RequestMethods[] = [
    'getOnly',
    'get',
    ['getAll', { query: { exclude: ['body'] } }],
  ]

  public content: Nuxtent.ContentArray

  public api: Nuxtent.Config.Api

  public build: Nuxtent.Config.Build

  public markdown: Nuxtent.Config.Markdown

  public toc: Nuxtent.Config.Toc

  public routePaths: Nuxtent.RoutePaths = new Map()

  public assetMap: Nuxtent.AssetMap = new Map()

  public database: Map<string, Database> = new Map()

  /**
   * @description An array of the static pages to render during generate
   *
   */
  public staticRoutes: string[] = []

  /**
   * @description Is a static (--generate) build
   *
   */
  public isStatic: boolean = false

  protected defaultContent: Nuxtent.Config.Content

  protected defaultBuild: Nuxtent.Config.Build = {
    buildDir: 'content',
    componentsDir: 'components',
    contentDir: 'content',
    contentDirWebpackAlias: '~/components',
    contentExtensions: ['json', 'md', 'yaml', 'yml'],
    ignorePrefix: '-',
    loaderComponentExtensions: ['.vue', '.js', '.mjs', '.tsx'],
  }

  protected get defaultApi(): Nuxtent.Config.Api {
    return {
      apiBrowserPrefix: this.publicPath + this.defaultBuild.buildDir,
      apiServerPrefix: '/content-api',
      baseURL: `http://${this.host}:${this.port}`,
      browserBaseURL: '',
      host: this.host,
      port: this.port,
    }
  }

  /**
   * @description The default container struture for content collections
   *
   * @memberOf NuxtentConfig
   */
  protected defaultContentContainer: Nuxtent.ContentArray

  private userConfig: Nuxtent.Config.User

  /**
   * Creates an instance of NuxtentConfig.
   * @param {Object} [moduleOptions={}] The module of the config found on nuxt.config.js
   * @param {Object} options The nuxt options found on ModuleContainer.options
   *
   * @memberOf NuxtentConfig
   */
  constructor(moduleOptions: Nuxt.ModuleConfiguration, options: Nuxt.Options) {
    this.build = { ...this.defaultBuild }
    this.markdown = {
      ...{ settigs: this.markdownSettings },
      ...this.defaultMarkdown,
    }
    this.toc = { ...this.defaultToc }
    this.api = { ...this.defaultApi }
    this.defaultContent = {
      breadcrumbs: false,
      data: undefined,
      isPost: false,
      markdown: { ...this.defaultMarkdown },
      method: [...this.requestMethods],
      page: '',
      permalink: ':slug',
      toc: { ...this.defaultToc },
    }
    this.defaultContentContainer = [
      ['/', this.defaultContent],
    ]
    this.content = this.defaultContentContainer
    this.userConfig = {
      api: { ...this.defaultApi },
      build: { ...this.defaultBuild },
      content: [ ...this.defaultContentContainer ],
      markdown: { ...this.defaultMarkdown },
      toc: { ...this.defaultToc },
    }
    this.userConfig = defaultsDeep({}, this.userConfig, moduleOptions, options.nuxtent)
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

  public setApi(options: Nuxt.Options) {
    this.host = options.host || this.host
    this.port = options.port || this.port
    process.env.NUXTENT_HOST = this.host
    process.env.NUXTENT_PORT = this.port
    this.api = defaultsDeep({}, this.defaultApi, this.userConfig.api)
  }

  public async init(rootDir = '~/'): Promise<NuxtentConfig> {
    const userConfig = await this.loadNuxtentConfig(rootDir)
    let content!: Nuxtent.ContentArray
    if (!Array.isArray(userConfig.content)) {
      content = [
        ['/', { ...this.defaultContent, ...userConfig.content }],
      ]
    } else {
      content = userConfig.content.map(([container, options]) => {
        return [container, defaultsDeep(options, this.defaultContent)]
      })
    }
    delete userConfig.content
    defaultsDeep(this.userConfig, userConfig)

    this.api = defaultsDeep({}, this.defaultApi, this.userConfig.api)
    this.build = defaultsDeep({}, this.defaultBuild, this.userConfig.build)
    this.markdown = defaultsDeep({}, this.defaultMarkdown, this.userConfig.markdown)
    this.toc = defaultsDeep({}, this.defaultToc, this.userConfig.toc)
    this.content = content
    this.markdown.parser = createParser(this.markdown)
    for (const [, contentEntry] of this.content) {
      contentEntry.markdown = defaultsDeep({}, contentEntry.markdown, this.markdown)
      contentEntry.markdown.parser = createParser(contentEntry.markdown)
    }
    this.buildContent()
    return Promise.resolve(this)
  }

  /**
   * Load the nuxtent config file
   * @param {String} rootDir The root of the proyect
   */
  public async loadNuxtentConfig(
    rootDir: string
  ): Promise<Nuxtent.Config.User> {
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
    dirOpts: Nuxtent.Config.Content = this.defaultContent
  ): Nuxtent.Config.Content {
    // End early if is falsey
    if (!dirOpts.toc) {
      dirOpts.toc = false
      return dirOpts
    }
    // Local var to set the config
    const tocConfig = this.defaultToc
    if (typeof dirOpts.toc === 'number') {
      defaultsDeep(tocConfig, {
        level: dirOpts.toc,
      })
    } else if (typeof dirOpts.toc === 'object') {
      defaultsDeep(tocConfig, dirOpts.toc)
    } else {
      dirOpts.toc = tocConfig
    }
    // Setting toc
    dirOpts.toc = tocConfig
    dirOpts.markdown.plugins.toc = [markdownItAnchor, tocConfig]
    dirOpts.markdown.plugins.markdownItTocDoneRight = [
      markdownItTocDoneRight,
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
        this.routePaths.set(pathToName(page), permalink)
      }
    })
  }

  /**
   * Intercept the nuxt routes and map them to nuxtent, usefull for date routes
   * @param {*} moduleContianer - A map with all the routes
   * @returns {void}
   */

  public interceptRoutes(moduleContianer: Nuxt.ModuleContainer): void {
    const renameRoutePath = (route: RouteConfig): RouteConfig => {
      if (!route.name) {
        return route
      }
      const overwritedPath = this.routePaths.get(route.name)
      if (overwritedPath !== undefined) {
        const isOptional = route.path.match(/\?$/)
        // QUESTION: Why did we had this?
        // const match = overwritedPath.match(/\/(.*)/)
        // if (match) {
        //   overwritedPath = match[1]
        // }
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
    moduleContianer.extendRoutes((routes: RouteConfig[], resolve) =>
      routes.map(renameRoutePath)
    )
  }

  public createContentDatabase() {
    this.content.forEach(([dirName, content]) => {
      const db = new Database(this.build, dirName, content)
      this.database.set(dirName, db)
    })
    return this.database
  }
}
