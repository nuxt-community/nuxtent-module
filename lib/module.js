import { join } from 'path'

import consola from 'consola'
import express from 'express'

import pkg from '../package.json'

import NuxtentConfig from './util/config'
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

  const config = new NuxtentConfig(moduleOptions, this.options)
  await config.init(this.options.rootDir)
  // TODO: Refactor arguments in order to simplify this
  // Build dynamic content pages without components (*.md)
  const { routePages, routePaths, assetMap } = await buildContent(config)
  const routesOptions = {
    contentDir: config.build.contentDir,
    content: config.content,
    isDev: this.nuxt.options.dev
  }
  // Maps the routes to nuxt
  interceptRoutes(this, routePaths)

  const contentDatabase = createContentDatabase(routesOptions)
  const router = createRouter(
    config.api.baseURL,
    config.api.apiServerPrefix,
    routesOptions,
    contentDatabase
  )
  // Add `$content` helper
  this.addPlugin({
    src: join(__dirname, '..', 'plugins', 'requestContent.template.js'),
    fileName: 'nuxtent.js',
    options: config
  })

  // Execute this just before everyting starts building
  this.nuxt.hook('build:before', async nuxt => {
    config.isStatic = nuxt.bundleBuilder.context.isStatic
    logger.info(
      `Nuxtent Initiated in ${config.isStatic ? 'static' : 'dynamic'} mode`
    )
  })
  this.nuxt.hook('generate:before', async (nuxt, generateOptions) => {
    createStaticRoutes(config, routePages, assetMap, contentDatabase)
    // Adds routes as assets so it may be procesed
    addAssets(this.options, assetMap)
    // add the routes to the routes array on the nuxt config
    addRoutes(generateOptions, routePages)
    console.log({ generateOptions })
  })
  // Execute this after all is builder
  this.nuxt.hook('build:done', () => {
    logger.info(`Generating: ${String(config.isStatic)}`)
    if (config.isStatic) {
      logger.info('opening server connection')

      const app = express()
      logger.info(
        `prefix: ${config.api.apiServerPrefix} baseurl: ${config.api.baseURL}`
      )
      app.use(config.api.apiServerPrefix, router)
      const server = app.listen(config.api.port)
      this.nuxt.hook('generate:done', () => {
        logger.info('closing server connection')
        server.close()
      })
    }
  })
  // Add content API when running `nuxt` & `nuxt build` (development and production)
  this.addServerMiddleware({
    path: config.api.apiServerPrefix,
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
            componentsDir: config.build.componentsDir,
            extensions: config.build.loaderComponentExtensions,
            content: config.content
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
