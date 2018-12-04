import { join } from 'path'

import consola from 'consola'
import express from 'express'

import pkg from '../package.json'

import loadConfig from './util/config'
import createRouter from './content/api'
import {
  buildContent,
  interceptRoutes,
  addRoutes,
  addAssets,
  createStaticRoutes,
  createContentDatabase
} from './content/build'

const logger = consola.withScope('nuxt:nuxtent')

export default async function nuxtentModule(moduleOptions) {
  // Adding nuxtent files to watcher prop
  this.options.watch.push('~/content', '~/nuxtent.config.js')

  const nuxtentConfig = await loadConfig(moduleOptions, this.options)
  // TODO: Refactor arguments in order to simplify this
  // Build dynamic content pages without components (*.md)
  const { routePages, routePaths, assetMap } = await buildContent(nuxtentConfig)
  const routesOptions = {
    contentDir: nuxtentConfig.build.contentDir,
    content: nuxtentConfig.content,
    isDev: this.nuxt.options.dev
  }
  // Maps the routes to nuxt
  interceptRoutes(this, routePaths)

  const contentDatabase = createContentDatabase(routesOptions)
  const router = createRouter(
    nuxtentConfig.api.baseURL,
    nuxtentConfig.api.apiServerPrefix,
    routesOptions,
    contentDatabase
  )
  // Add `$content` helper
  this.addPlugin({
    src: join(__dirname, '..', 'plugins', 'requestContent.template.js'),
    fileName: 'nuxtent.js',
    options: nuxtentConfig
  })

  // Execute this just before everyting starts building
  this.nuxt.hook('build:before', async nuxt => {
    nuxtentConfig.isStatic = nuxt.bundleBuilder.context.isStatic
    logger.info(
      `Nuxtent Initiated in ${
        nuxtentConfig.isStatic ? 'static' : 'dynamic'
      } mode`
    )
  })
  this.nuxt.hook('generate:before', async (nuxt, generateOptions) => {
    createStaticRoutes(nuxtentConfig, routePages, assetMap, contentDatabase)
    // Adds routes as assets so it may be procesed
    addAssets(this.options, assetMap)
    // add the routes to the routes array on the nuxt config
    addRoutes(generateOptions, routePages)
    console.log({ generateOptions })
  })
  // Execute this after all is builder
  this.nuxt.hook('build:done', () => {
    logger.info(`Generating: ${String(nuxtentConfig.isStatic)}`)
    if (nuxtentConfig.isStatic) {
      logger.info('opening server connection')

      const app = express()
      logger.info(
        `prefix: ${nuxtentConfig.api.apiServerPrefix} baseurl: ${
          nuxtentConfig.api.baseURL
        }`
      )
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
  this.extendBuild(config => {
    config.module.rules.push({
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

/**
 * @description Genera objeto de componentes dinamicos
 *
 * @param {Map} assetMap El mapa de páginas
 * @returns {String[]} array
 */
function generatePluginMap(assetMap) {
  const webpackAlias = '~/content'
  const mdComps = []
  for (const collections of assetMap.values()) {
    for (const page of collections.__pagesMap.values()) {
      if (page.meta.fileName.endsWith('.comp.md')) {
        let filePath = webpackAlias + page.body.relativePath.substring(1)
        mdComps.push([page.body.relativePath, filePath])
      }
    }
  }
  return mdComps
}

export { pkg as meta }
