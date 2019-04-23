import pkg from '../package.json'

// import { join } from 'path'
// import micro from 'micro'
import NuxtentConfig from './config'
import createRouter from './content/api'
// import { addRoutes, addAssets, createStaticRoutes } from './content/build'
import { logger, generatePluginMap } from './utils'
import { Nuxt } from '../types/nuxt.js'
import { join } from 'path'
import { Configuration as WebpackConfiguration } from 'webpack'
/**
 * @description The Nuxtent Module
 * @export
 */

let server
async function nuxtentModule(
  this: Nuxt.ModuleContainer,
  moduleOptions: Nuxt.ModuleConfiguration
): Promise<void> {
  const self = this
  // Adding nuxtent files to watcher prop
  self.options.watch.push('~/nuxtent.config.js')
  const nuxtentConfig = new NuxtentConfig(moduleOptions, self.options)

  // This section starts as early as possible
  await nuxtentConfig.init(self.options.rootDir)
  nuxtentConfig.createContentDatabase()
  const router = createRouter(nuxtentConfig)

  // Generate Vue templates from markdown with components (*.comp.md)
  this.extendBuild((config: WebpackConfiguration, loaders) => {
    if (config.module) {
      config.module.rules.push({
        test: /\.comp\.md$/,
        use: [
          'vue-loader',
          {
            loader: require.resolve('./loader.ts'),
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

  // Add content API when running `nuxt` & `nuxt build` (development and production)
  this.addServerMiddleware({
    handler: router,
    path: nuxtentConfig.api.apiServerPrefix,
  })

  this.options.build.templates.push({
    dst: 'nuxtent-config.js', // We import it manyally
    options: nuxtentConfig.config,
    src: require.resolve('./plugins/nuxtent-config.template'),
  })
  // Execute this just before everyting starts building
  self.nuxt.hook('build:before', async (builder: any, buildOptions: any) => {
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
      src: join(__dirname, '..', 'plugins', 'nuxtent-components.template.js'),
    })
  })

  // this.nuxt.hook('generate:before', async (nuxt: any, generateOptions: any) => {
  //   createStaticRoutes(nuxtentConfig, contentDatabase)
  //   // Adds routes as assets so it may be procesed
  //   addAssets(this.options, nuxtentConfig.assetMap)
  //   // add the routes to the routes array on the nuxt config
  //   addRoutes(generateOptions, nuxtentConfig.staticRoutes)
  // })
  // // Execute this after all is builder
  // this.nuxt.hook('build:done', () => {
  //   logger.info(`Generating: ${String(nuxtentConfig.isStatic)}`)
  //   if (nuxtentConfig.isStatic) {
  //     logger.info('opening server connection')
  //     const app = micro(router)
  //     logger.info(
  //       `prefix: ${nuxtentConfig.api.apiServerPrefix} baseurl: ${
  //         nuxtentConfig.api.baseURL
  //       }`
  //     )
  //     const server = app.listen(nuxtentConfig.api.port)
  //     this.nuxt.hook('generate:done', () => {
  //       logger.info('closing server connection')
  //       server.close()
  //     })
  //   }
  // })
}

export { pkg as meta }
export default nuxtentModule
