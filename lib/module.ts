import * as pkg from '../package.json'

import micro from 'micro'
import NuxtentConfig from './config'
import createRouter from './content/api'
import { addAssets, createStaticRoutes } from './content/build'
import { logger, generatePluginMap } from './utils'
import { Nuxt } from '../types/nuxt.js'
import { Configuration as WebpackConfiguration } from 'webpack'
import createServer from 'connect'

/**
 * @description The Nuxtent Module
 * @export
 */

async function nuxtentModule(
  this: Nuxt.ModuleContainer,
  moduleOptions: Nuxt.ModuleConfiguration
): Promise<void> {
  const self = this
  // Adding nuxtent files to watcher prop
  self.options.watch.push('~/nuxtent.config.js')
  const nuxtentConfig = new NuxtentConfig(moduleOptions, self.options)

  // This section starts as early as possible
  nuxtentConfig.setApi(self.options)
  await nuxtentConfig.init(self.options.rootDir)
  nuxtentConfig.createContentDatabase()

  // Add content API when running `nuxt` & `nuxt build` (development and production)
  const nuxtentRouter = createRouter(nuxtentConfig)
  this.addServerMiddleware({
    handler: nuxtentRouter,
    path: nuxtentConfig.api.apiServerPrefix,
  })

  this.options.build.templates.push({
    dst: 'nuxtent-config.js', // We import it manyally
    options: nuxtentConfig.config,
    src: require.resolve('./plugins/nuxtent-config.template'),
  })

  // Generate Vue templates from markdown with components (*.comp.md)
  this.extendBuild((config: WebpackConfiguration, loaders) => {
    if (config.module) {
      config.module.rules.push({
        test: /\.comp\.md$/,
        use: [
          'vue-loader',
          {
            loader: require.resolve('./loader'),
            options: {
              componentsDir: nuxtentConfig.build.componentsDir,
              content: nuxtentConfig.content,
              database: nuxtentConfig.database,
              extensions: nuxtentConfig.build.loaderComponentExtensions,
            },
          },
        ],
      })
    }
  })

  this.nuxt.hook('listen', async () => {
    nuxtentConfig.setApi(self.options)
  })

  // Execute this just before everyting starts building
  self.nuxt.hook('build:before', async (builder: any, buildOptions: any) => {
    // Sets the static mode
    const isStatic =
      ((builder.bundleBuilder || {}).buildContext || {}).isStatic ||
      process.static
    if (typeof isStatic === 'undefined') {
      logger.error("Can't define if this is a static build or not")
    }
    nuxtentConfig.isStatic = !!isStatic
    logger.info(
      `Nuxtent Initiated in ${
        nuxtentConfig.isStatic ? 'static' : 'dynamic'
      } mode`
    )
    nuxtentConfig.interceptRoutes(self)
    // Add `$content` helper

    this.addPlugin({
      src: require.resolve('./plugins/nuxtent-request'), // ts or js
    })
    // // Add Vue templates generated from markdown with components (*.comp.md) to output build
    this.addPlugin({
      options: {
        components: generatePluginMap(nuxtentConfig.database),
      },
      src: require.resolve('./plugins/nuxtent-components.template'),
    })
  })

  this.nuxt.hook('generate:before', async (nuxt: any, generateOptions: any) => {
    createStaticRoutes(nuxtentConfig)
    // Adds routes as assets so it may be procesed
    addAssets(this.options, nuxtentConfig.assetMap)
    // add the routes to the routes array on the nuxt config
    generateOptions.routes = generateOptions.routes
      ? generateOptions.routes.concat(nuxtentConfig.staticRoutes)
      : nuxtentConfig.staticRoutes
  })
  // // Execute this after all is builder
  this.nuxt.hook('build:done', async () => {
    logger.info(`Generating: ${String(nuxtentConfig.isStatic)}`)
    if (nuxtentConfig.isStatic) {
      logger.info('opening server connection')
      const app = await micro(
        // @ts-ignore
        nuxtentRouter.namespaced()
      )
      logger.info(
        `prefix: ${nuxtentConfig.api.apiServerPrefix} baseurl: ${
          nuxtentConfig.api.baseURL
        }`
      )
      const server = await app.listen(nuxtentConfig.api.port)

      this.nuxt.hook('generate:done', () => {
        logger.info('closing server connection')
        server.close()
      })
    }
  })
}

export { pkg as meta }
export default nuxtentModule
