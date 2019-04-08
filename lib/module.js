
import * as pkg from '../package.json'

import { join } from 'path'
import express from 'express'
import NuxtentConfig from './config'
import createRouter from './content/api'
import { addRoutes, addAssets, createStaticRoutes } from './content/build'
import { logger, generatePluginMap } from './utils'
/**
 * @description The Nuxtent Module
 * @export
 * @this {Object}
 * @param {*} moduleOptions The module container options
 * @returns {Promise.<void>} null
 */
export default async function nuxtentModule(moduleOptions) {
  // Adding nuxtent files to watcher prop
  this.options.watch.push('~/content', '~/nuxtent.config.js')
  const nuxtentConfig = new NuxtentConfig(moduleOptions, this.options)
  await nuxtentConfig.init(this.options.rootDir)
  nuxtentConfig.interceptRoutes(this)
  // TODO: Refactor arguments in order to simplify this
  const routesOptions = {
    contentDir: nuxtentConfig.build.contentDir,
    content: nuxtentConfig.content,
    isDev: this.nuxt.options.dev
  }
  // Maps static the routes to nuxt
  const contentDatabase = nuxtentConfig.createContentDatabase()
  const router = createRouter(nuxtentConfig.api.baseURL, nuxtentConfig.api.apiServerPrefix, routesOptions, contentDatabase)
  // Add `$content` helper
  this.addPlugin({
    src: join(__dirname, '..', 'plugins', 'requestContent.template.js'),
    fileName: 'nuxtent.js',
    options: nuxtentConfig
  })
  // Execute this just before everyting starts building
  this.nuxt.hook('build:before', async (nuxt) => {
    const isStatic = ((nuxt.bundleBuilder || {}).buildContext || {}).isStatic
    if (typeof isStatic === 'undefined') {
      logger.error("Can't define if this is a static build or not")
    }
    nuxtentConfig.isStatic = !!isStatic
    logger.info(`Nuxtent Initiated in ${nuxtentConfig.isStatic ? 'static' : 'dynamic'} mode`)
  })
  this.nuxt.hook('generate:before', async (nuxt, generateOptions) => {
    createStaticRoutes(nuxtentConfig, contentDatabase)
    // Adds routes as assets so it may be procesed
    addAssets(this.options, nuxtentConfig.assetMap)
    // add the routes to the routes array on the nuxt config
    addRoutes(generateOptions, nuxtentConfig.staticRoutes)
  })
  // Execute this after all is builder
  this.nuxt.hook('build:done', () => {
    logger.info(`Generating: ${String(nuxtentConfig.isStatic)}`)
    if (nuxtentConfig.isStatic) {
      logger.info('opening server connection')
      const app = express()
      logger.info(`prefix: ${nuxtentConfig.api.apiServerPrefix} baseurl: ${nuxtentConfig.api.baseURL}`)
      app.use(nuxtentConfig.api.apiServerPrefix, router)
      const server = app.listen(nuxtentConfig.api.port)
      this.nuxt.hook('generate:done', () => {
        logger.info('closing server connection')
        server.close()
      })
    }
  })
  // Add content API when running `nuxt` & `nuxt build` (development and production)
  this.addServerMiddleware({
    path: nuxtentConfig.api.apiServerPrefix,
    handler: router
  })
  // Generate Vue templates from markdown with components (*.comp.md)
  this.extendBuild(c => {
    c.module.rules.push({
      test: /\.comp\.md$/,
      use: [
        'vue-loader',
        {
          loader: join(__dirname, 'loader'),
          options: {
            componentsDir: nuxtentConfig.build.componentsDir,
            extensions: nuxtentConfig.build.loaderComponentExtensions,
            content: nuxtentConfig.content
          }
        }
      ]
    })
  })
  // Add Vue templates generated from markdown with components (*.comp.md) to output build
  this.addPlugin({
    src: join(__dirname, '..', 'plugins', 'markdownComponents.template.js'),
    fileName: 'markdown-components.js',
    options: {
      components: generatePluginMap(contentDatabase)
    }
  })
}

export { pkg as meta }
