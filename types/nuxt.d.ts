import NuxtConfiguration, {
  Render as NuxtConfigurationRender,
  Build as NuxtConfigurationBuild,
  Router as NuxtConfigurationRouter,
  Module as NuxtConfigurationModule,
} from '@nuxt/config'
import {
  RouteConfig,
  RouterMode,
  Route,
  RouterOptions as VueRouterOptions,
} from 'vue-router'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { Options as WebpackDevMiddlewareOptions } from 'webpack-dev-middleware'
import { Options as WebpackHotMiddlewareOptions } from 'webpack-hot-middleware'
import { Options as HtmlMinifierOptions } from 'html-minifier'
import { Options as OptimizeCssAssetsWebpackPluginOptions } from 'optimize-css-assets-webpack-plugin'
import { TerserPluginOptions } from 'terser-webpack-plugin'
import {
  Configuration as WebpackConfiguration,
  Options as WebpackOptions,
  Plugin as WebpackPlugin,
  RuleSetQuery,
} from 'webpack'
import { BundleRendererOptions } from 'vue-server-renderer'
import { CompressionOptions } from 'compression'
import { ServeStaticOptions } from 'serve-static'
import { Options as EtagOptions } from 'etag'
import createServer from 'connect'
declare namespace Nuxt {
  interface Loaders {
    [loader: string]: RuleSetQuery

    css: {
      sourceMap: boolean
    }
    cssModules: {
      localIdentName: string
      sourceMap: boolean
    }
    file: {}
    fontUrl: {
      limit: number
    }
    imgUrl: {
      limit: number
    }
    less: {
      sourceMap: boolean
    }
    pugPlain: {}
    sass: {
      indentedSyntax: boolean
      sourceMap: boolean
    }
    scss: {
      sourceMap: boolean
    }
    stylus: {
      sourceMap: boolean
    }
    ts: {
      appendTsSuffixTo: RegExp[]
      transpileOnly: boolean
    }
    tsx: {
      appendTsxSuffixTo: RegExp[]
      transpileOnly: boolean
    }
    vue: {
      productionMode: boolean
      transformAssetUrls: {
        embed: string
        object: string
        source: string
        video: string
      }
    }
    vueStyle: {
      sourceMap: boolean
    }
  }

  type BuildFilenames = {
    [key in 'app' | 'chunk' | 'css' | 'img' | 'font' | 'video']?: (ctx: {
      isDev: boolean
    }) => string
  }

  interface Render extends NuxtConfigurationRender {
    bundleRenderer: BundleRendererOptions
    compressor: CompressionOptions
    csp: boolean
    dist: ServeStaticOptions
    etag: EtagOptions | false
    fallback: {
      dist: {}
      static: {
        handlers: {
          '.htm': boolean
          '.html': boolean
        }
        skipUnknown: boolean
      }
    }
    http2: {
      push: boolean
      pushAssets: any
      shouldPush: any
    }
    resourceHints: boolean
    ssr: boolean
    static: ServeStaticOptions
  }

  interface Build extends NuxtConfigurationBuild {
    analyze: BundleAnalyzerPlugin.Options | boolean
    babel: {
      babelrc: boolean
      cacheDirectory: boolean
      configFile: boolean
    }
    cache: boolean
    crossorigin: string
    cssSourceMap: boolean
    devMiddleware: WebpackDevMiddlewareOptions
    extractCSS: boolean
    filenames: BuildFilenames
    friendlyErrors: boolean
    hardSource: boolean
    hotMiddleware: WebpackHotMiddlewareOptions
    html: { minify: HtmlMinifierOptions }
    loaders: Loaders
    optimization: WebpackOptions.Optimization
    optimizeCSS: OptimizeCssAssetsWebpackPluginOptions | boolean
    parallel: boolean
    plugins: WebpackPlugin[]
    postcss: {
      preset: {
        stage: number
      }
    }
    profile: boolean
    publicPath: string
    quiet: boolean
    splitChunks: {
      commons: boolean
      layouts: boolean
      pages: boolean
    }
    ssr: boolean
    standalone: boolean
    stats: {
      excludeAssets: RegExp[]
    }
    styleResources: {}
    template: any
    templates: any[]
    terser: TerserPluginOptions | boolean
    transpile: (string | RegExp)[]
    typescript: {
      typeCheck: { [key: string]: any } | boolean
    }
    watch: string[]
  }
  type RoutePosition = { x: number; y: number }
  type RoutePositionResult =
    | RoutePosition
    | { selector: string; offset?: RoutePosition }
    | void
  namespace Router {
    type callBackExtendRoutes = (
      routes: RouteConfig[],
      resolve: (...pathSegments: string[]) => string
    ) => void
    type extendRoutes = (callback: callBackExtendRoutes) => void
    // (routes: RouteConfig[],resolve: (...pathSegments: string[]) => string) => void
  }
  interface RouterOptions extends VueRouterOptions {
    base: string
    extendRoutes: Router.extendRoutes
    fallback: boolean
    linkActiveClass: string
    linkExactActiveClass: string
    linkPrefetchedClass: string
    middleware: string[] | string
    mode: RouterMode
    parseQuery: (query: string) => Object
    prefetchLinks: boolean
    routeNameSplitter: string
    routes: RouteConfig[]
    scrollBehavior: (
      to: Route,
      from: Route,
      savedPosition: RoutePosition | void
    ) => RoutePositionResult | Promise<RoutePositionResult>
    stringifyQuery: (query: Object) => string
  }

  interface Options {
    [key: string]: any
    host: string
    port: string
    ErrorPage: any
    appTemplatePath: string
    build: Build
    buildDir: string
    cli: {
      badgeMessages: any[]
    }
    css: string[]
    debug: boolean
    dev: boolean
    devModules: string[]
    dir: {
      assets: string
      layouts: string
      middleware: string
      pages: string
      static: string
      store: string
    }
    editor: any
    env: {}
    extensions: string[]
    fetch: {
      client: boolean
      server: boolean
    }
    generate: {
      concurrency: number
      dir: string
      exclude: any[]
      fallback: string
      interval: number
      routes: any[]
      subFolders: boolean
    }
    globalName: string
    globals: {
      context: any
      id: any
      loadedCallback: any
      nuxt: any
      pluginPrefix: any
      readyCallback: any
    }
    head: {
      link: any[]
      meta: any[]
      script: any[]
      style: any[]
    }
    hooks: any
    ignore: string[]
    ignorePrefix: string
    layoutTransition: {
      mode: string
      name: string
    }
    layouts: {}
    loading: {
      color: string
      continuous: boolean
      css: boolean
      duration: number
      failedColor: string
      height: string
      rtl: boolean
      throttle: number
    }
    loadingIndicator: {
      background: string
      color: string
      color2: string
      dev: boolean
      loading: string
      name: string
    }
    messages: {
      back_to_home: string
      client_error: string
      client_error_details: string
      error_404: string
      loading: string
      nuxtjs: string
      server_error: string
      server_error_details: string
    }
    mode: 'spa' | 'universal'
    modern: 'client' | 'server' | boolean
    modes: {
      spa: {
        build: {
          ssr: boolean
        }
        render: {
          ssr: boolean
        }
      }
      universal: {
        build: {
          ssr: boolean
        }
        render: {
          ssr: boolean
        }
      }
    }
    modules: any[]
    modulesDir: string[]
    plugins: any[]
    render: Render
    rootDir: string
    router: RouterOptions
    server: {
      host: string
      https:
        | false
        | {
            cert: string | Buffer
            key: string | Buffer
          }
      port: number
      socket: string
      timing: boolean | { total: boolean }
    }
    serverMiddleware: any[]
    srcDir: string
    styleExtensions: string[]
    test: boolean
    transition: {
      appear: boolean
      appearActiveClass: string
      appearClass: string
      appearToClass: string
      mode: string
      name: string
    }
    vue: {
      config: {
        performance: boolean
        silent: boolean
      }
    }
    watch: string[]
    watchers: {
      chokidar: {
        ignoreInitial: boolean
      }
      rewatchOnRawEvents: string[]
      webpack: {}
    }
  }

  type ModuleConfiguration = NuxtConfigurationModule

  interface Server {
    [key: string]: any
  }
  interface Resolver {
    [key: string]: any
  }
  interface Renderer {
    [key: string]: any
  }
  interface Builder {
    [key: string]: any
  }
  interface Nuxt {
    [k: string]: any
    options: Options
    hook: (
      hookName: string,
      fn: (builder: Builder, buildOptions: Build) => void
    ) => void
    callHook: () => void
    showReady: () => void
    resolver: Resolver
    moduleContainer: ModuleContainer
    server: Server
    renderer: Renderer
  }
  namespace ModuleContainer {
    interface TemplateObject {
      src: string
      dst?: string
      fileName?: string
      options?: {
        [key: string]: any
      }
    }
    type template = string | TemplateObject
  }
  interface ModuleContainer {
    nuxt: Nuxt
    options: Options
    addPlugin: (template: ModuleContainer.template) => void
    addServerMiddleware: (
      middleware:
        | string
        | { path: string; handler: string | createServer.NextHandleFunction }
        | createServer.NextHandleFunction
    ) => void
    extendBuild: (
      cb: (
        config: WebpackConfiguration,
        ctx: {
          isDev: boolean
          isClient: boolean
          isServer: boolean
          loaders: Loaders
        }
      ) => void
    ) => void
    extendRoutes: Router.extendRoutes
    requiredModules: {
      [module: string]: {
        src: string
        options?: any
        handler: CallableFunction
      }
    }
  }
}
