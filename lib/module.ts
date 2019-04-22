import pkg from '../package.json'

// import { join } from 'path'
// import micro from 'micro'
import NuxtentConfig from './config'
import createRouter from './content/api'
// import { addRoutes, addAssets, createStaticRoutes } from './content/build'
import { logger, generatePluginMap } from './utils'
import { Nuxt } from '../types/nuxt.js'

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

  self.nuxt.hook('build:before', async (builder: any, buildOptions: any) => {
    const isStatic = ((builder.bundleBuilder || {}).buildContext || {}).isStatic
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
  })
  await nuxtentConfig.init(self.options.rootDir)
  nuxtentConfig.createContentDatabase()
  const router = createRouter(nuxtentConfig)
  this.addServerMiddleware({
    handler: router,
    path: nuxtentConfig.api.apiServerPrefix,
  })
  // // TODO: Refactor arguments in order to simplify this
  // const routesOptions = {
  //   contentDir: nuxtentConfig.build.contentDir,
  //   content: nuxtentConfig.content,
  //   isDev: this.nuxt.options.dev,
  // }
  // // Maps static the routes to nuxt
  // const contentDatabase = nuxtentConfig.createContentDatabase()
  // const router = createRouter(
  //   nuxtentConfig.api.baseURL,
  //   nuxtentConfig.api.apiServerPrefix,
  //   routesOptions,
  //   contentDatabase
  // )
  // // Add `$content` helper
  // this.addPlugin({
  //   dst: 'nuxtent.js',
  //   options: nuxtentConfig,
  //   src: join(__dirname, '..', 'plugins', 'requestContent.template.js'),
  // })
  // // Execute this just before everyting starts building
  // this.nuxt.hook('build:before', async (nuxt: any) => {
  //   const isStatic = ((nuxt.bundleBuilder || {}).buildContext || {}).isStatic
  //   if (typeof isStatic === 'undefined') {
  //     logger.error("Can't define if this is a static build or not")
  //   }
  //   nuxtentConfig.isStatic = !!isStatic
  //   logger.info(
  //     `Nuxtent Initiated in ${
  //       nuxtentConfig.isStatic ? 'static' : 'dynamic'
  //     } mode`
  //   )
  // })
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
  // // Add content API when running `nuxt` & `nuxt build` (development and production)
  // this.addServerMiddleware({
  //   handler: router,
  //   path: nuxtentConfig.api.apiServerPrefix,
  // })
  // // Generate Vue templates from markdown with components (*.comp.md)
  // this.extendBuild(c => {
  //   c.module.rules.push({
  //     test: /\.comp\.md$/,
  //     use: [
  //       'vue-loader',
  //       {
  //         loader: join(__dirname, 'loader'),
  //         options: {
  //           componentsDir: nuxtentConfig.build.componentsDir,
  //           extensions: nuxtentConfig.build.loaderComponentExtensions,
  //           content: nuxtentConfig.content,
  //         },
  //       },
  //     ],
  //   })
  // })
  // // Add Vue templates generated from markdown with components (*.comp.md) to output build
  // this.addPlugin({
  //   src: join(__dirname, '..', 'plugins', 'markdownComponents.template.js'),
  //   dst: 'markdown-components.js',
  //   options: {
  //     components: generatePluginMap(contentDatabase),
  //   },
  // })
}

export { pkg as meta }
export default nuxtentModule
