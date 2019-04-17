import MarkdownIt from 'markdown-it'
// import { NuxtConfiguration } from '@nuxt/config'
// export NuxtConfiguration
export namespace INuxtent {
  type RequestMethods = 'get' | 'getOnly' | ['getAll', { query: Query }]
  /**
   * The query arguments for the api
   */
  interface Query {
    /** Page properties to be excluded from request. */
    exclude?: string
    /** The arguments for between and only methods */
    args?: Array<string>
  }

  type ConfigContentGenereate = Array<
    RequestMethods | [RequestMethods, ConfigQueries]
  >
  interface ConfigContent {
    /** Wheather treat this container content as blog like post or not */
    isPost: boolean
    /**
     * The data to pass as default frontmatter info and injected into async
     * components
     */
    data?: Object
    /** Generate breadcrumbs for nested content */
    breadcrumbs: boolean
    /** The toc configuration for this container */
    toc: ConfigToc | Number | boolean
    /**
     * The vue file where the content will be used, is necesary to rewrite
     * the route for post mode
     */
    page: string
    /**
     * The route that will generate the permalink,
     * you can define something like `/:year/:slug` for post files
     */
    permalink: string
    /** The query methods to generate */
    method: ConfigContentGenereate
    /** The specific markdown configuration for this container */
    markdown: ConfigMarkdown
    parser?: () => void
  }

  /**
   * The api configuration for nuxtent
   */
  interface ConfigApi {
    /** The host to use for generate and ssr requests */
    host: string
    /** The port to use for generate and ssr requests */
    port: number | string
    /**
     * The url for ssr requests
     * `http://${host}:${port}`
     */
    baseURL: string
    /** The borswer domain or base, usefull for cdn setups */
    browserBaseURL: string
    /** The prefix to serve the api with ssr */
    apiServerPrefix: string
    /** The prefix for static or spa sites `/._nuxt/content` */
    apiBrowserPrefix: string
  }

  interface ConfigBuild {
    /** The alias used by webpack for the components folder */
    contentDirWebpackAlias: string
    /** Prefix for igonring content files */
    ignorePrefix: string
    /** The path for the content directory */
    contentDir: string
    /** The path where the components are located */
    componentsDir: string
    /** The folder output when generating */
    buildDir: string
    /** The parser instance */
    loaderComponentExtensions: Array<String>
  }
  interface ConfigQueries {
    query: Query
  }
  interface ConfigToc {
    /** The depth level to mark anchors */
    level: number
    /** Attach permalink or not */
    permalink: boolean
    /** he class to add to the permalink */
    permalinkClass: string
    /** The symbol to use as a permalink */
    permalinkSymbol: string
    /** The function to slugify the permalink */
    slugify(str: string): string
  }

  interface MarkdownSettings {
    preset: 'default' | 'commonmark' | 'zero'
    html?: boolean
    xhtmlOut?: boolean
    breaks?: boolean
    langPrefix?: string
    linkify?: boolean
    typographer?: boolean
    quotes?: string
    highlight?: (str: string, lang: string) => void
  }

  interface ConfigMarkdown {
    /**
     * The plugins to use on markdown,
     * must be a object where key is the name of the plugin and the value an array
     * or the plugin instance
     * `{ pluginName: [pluginModule, config] }`
     */
    plugins: { [pluginName: string]: [NodeModule | Function, Object] }
    /**
     * Raw plugins for markdownit
     */
    use: [[(md: MarkdownIt, ...params: any[]) => void, ...any[]]] | never[]
    /**
     * A function where you have access to the full
     * markdown-it config as first param and you can modify it
     */
    extend?: Function
    /**
     * The private parser instance
     */
    parser?: Function
    /**
     * A function where you have access to the markdown-it instance as a first
     * paramaeter
     */
    customize?: (md: MarkdownIt) => void
    /** The markdown Settings */
    settings: MarkdownSettings
  }
  type ContentArray = Array<[string, ConfigContent]>
  type ConfigContentUser = ConfigContent | ContentArray
  interface Config {
    api: ConfigApi
    markdown: ConfigMarkdown
    toc: ConfigToc
    build: ConfigBuild
    content: ContentArray
  }

  interface ConfigUser {
    api: ConfigApi
    markdown: ConfigMarkdown
    toc: ConfigToc
    build: ConfigBuild
    content: ConfigContentUser
  }

  type RoutePaths = Map<string, string>
  type AssetMap = Map<string, string>
}

export interface ILodashTemplate {
  src: string // `src` can be absolute or relative
  dst: string // `dst` is relative to project `.nuxt` dir
  // Options are provided to template as `options` key
  options: any
}
