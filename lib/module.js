import { join } from 'path'

import consola from 'consola'
import express from 'express'

import pkg from '../package.json'

import loadConfig from './util/config'
import createRouter from './content/api'
import buildContent from './content/build'

const logger = consola.withScope('nuxt:nuxtent')

export default function contentModule(moduleOptions) {
  const options = loadConfig(moduleOptions, this.options)
  // TODO: Refactor arguments in order to simplify this
  const routesOptions = {
    contentDir: options.build.contentDir,
    content: options.content,
    isDev: this.nuxt.options.dev
  }
  this.nuxt.hook('build:before', builder => {
    options.isStatic = builder.isStatic
    logger.info(
      'Nuxtent Initiated in ' + options.isStatic ? 'static' : 'dynamic' + 'mode'
    )
    // Build dynamic content pages without components (*.md)
    buildContent(this, options.build.buildDir, options.isStatic, routesOptions)
  })
  this.nuxt.hook('build:done', () => {
    if (options.isStatic) {
      logger.info('opening server connection')

      const app = express()
      logger.info(
        `prefix: ${options.api.apiServerPrefix} baseurl: ${options.api.baseURL}`
      )
      app.use(
        options.api.apiServerPrefix,
        createRouter(
          options.api.baseURL,
          options.api.apiServerPrefix,
          routesOptions
        )
      )
      const server = app.listen(options.api.port)
      this.nuxt.hook('generate:done', () => {
        logger.info('closing server connection')
        server.close()
      })
    }
  })
  // Add content API when running `nuxt` & `nuxt build` (development and production)
  this.addServerMiddleware({
    path: options.api.apiServerPrefix,
    handler: createRouter(
      options.api.baseURL,
      options.api.apiServerPrefix,
      routesOptions
    )
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
            componentsDir: options.build.componentsDir,
            extensions: options.build.loaderComponentExtensions,
            content: options.content
          }
        }
      ]
    })
  })

  // Add `$content` helper
  this.addPlugin({
    src: join(__dirname, 'plugins/requestContent.template.js'),
    fileName: 'nuxtent.js',
    options
  })

  // Add Vue templates generated from markdown with components (*.comp.md) to output build
  this.addPlugin({
    src: join(__dirname, 'plugins/markdownComponents.template.js'),
    fileName: 'markdownComponents.js',
    options: {
      contentDirWebpackAlias: '~/content'
    }
  })
}

export { pkg as meta }
