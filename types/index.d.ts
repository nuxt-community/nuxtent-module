import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'

// import { NuxtConfiguration } from '@nuxt/config'
// export NuxtConfiguration
import Page from '../lib/content/page'

declare namespace NodeJS {
  interface Process {
    browser: boolean
    client: boolean
    mode: 'spa' | 'universal'
    modern: boolean
    server: boolean
    static: boolean
  }
}

export namespace Nuxtent {
  type RequestMethods = 'get' | 'getOnly' | ['getAll', Config.Queries]
  type ContentFileExtensions = 'yaml' | 'yml' | 'md' | 'json'

  namespace Page {
    type PageProp =
      | 'breadcrumbs'
      | 'meta'
      | 'date'
      | 'path'
      | 'permalink'
      | 'attributes'
      | 'body'
      | 'toc'

    interface Breadcrumbs {
      permalink: string
      frontMatter: {
        excerpt?: string
        [frontMatterKey: string]: any
      }
    }
    interface Attributes {
      excerpt?: string
      [frontMatterKey: string]: any
    }
    interface RawData {
      attributes: Attributes
      body: {
        content?: string
        relativePath?: string
      }
      fileName?: string
    }

    interface TocEntry {
      level?: number
      title?: string
      slug?: string
      link?: string
    }

    type Anchors = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | string

    interface PageToc {
      title?: string
      tag?: Anchors
      slug?: string
      topLevel: Number
      items: {
        [anchor: string]: TocEntry
      }
    }

    type Body = string | { relativePath: string }
    interface PageData {
      meta?: Database.FileMeta
      date: string | Date | null
      path: string | null
      permalink: string | null
      attributes: Attributes
      breadcrumbs?: Breadcrumbs[]
      toc?: {
        [permalink: string]: PageToc
      }
      data: RawData
      body: Body | null
    }

    interface PublicPage {
      meta?: Database.FileMeta
      date?: string | Date | null
      path: string | null
      permalink: string
      attributes: Attributes
      breadcrumbs?: Breadcrumbs[]
      toc?: PageToc
      body: Body
    }
  }

  namespace Database {
    interface FileMeta {
      /** The index of the file */
      index: number
      /** The filename */
      fileName: string
      /** The section aka folder of the file */
      section: string
      /** The section aka folder of the file */
      filePath?: string
      /** The directory for the content */
      dirName: string
    }
  }

  namespace Config {
    interface User {
      api: Api
      markdown: Markdown
      toc: Toc
      build: Build
      content: ContentUser
    }
    interface Content {
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
      toc: Toc | Number | boolean
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
      markdown: Markdown
      parser: MarkdownIt
    }

    interface Api {
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

    interface Build {
      contentExtensions: ContentFileExtensions[]
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
    interface Queries {
      query: Query
      args?: OnlyArg
    }
    interface Toc extends markdownItAnchor.AnchorOptions {
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

    interface Markdown {
      /**
       * The plugins to use on markdown,
       * must be a object where key is the name of the plugin and the value an array
       * or the plugin instance
       * `{ pluginName: [pluginModule, config] }`
       */
      plugins: { [pluginName: string]: [CallableFunction, any] }
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
      parser?: MarkdownIt
      /**
       * A function where you have access to the markdown-it instance as a first
       * paramaeter
       */
      customize?: (md: MarkdownIt) => void
      /** The markdown Settings */
      settings: MarkdownSettings
    }
    type ContentUser = Config.Content | ContentArray
    interface Config {
      api: Api
      markdown: Markdown
      toc: Toc
      build: Build
      content: ContentArray
    }

    type ConfigContentGenereate = Array<
      RequestMethods | [RequestMethods, Config.Queries]
    >
  }

  type FileStore = Map<string, Page>
  /**
   * The query arguments for the api
   */
  interface Query {
    /** Page properties to be excluded from request. */
    exclude?: Array<Page.PageProp>
    /** The arguments for between and only methods */
    args?: Array<string>
  }

  type OnlyArg = string[] | [string, string] | string | [number, number]

  type ContentArray = Array<[string, Config.Content]>
  type RoutePaths = Map<string, string>
  type AssetMap = Map<string, Page.PublicPage | Page.PublicPage[]>
}

export interface ILodashTemplate {
  src: string // `src` can be absolute or relative
  dst: string // `dst` is relative to project `.nuxt` dir
  // Options are provided to template as `options` key
  options: any
}
