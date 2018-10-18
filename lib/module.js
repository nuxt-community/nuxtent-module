import { join } from 'path'

import consola from 'consola'
import express from 'express'

import pkg from '../package.json'

import loadConfig from './util/config'
import createRouter from './content/api'
import buildContent from './content/build'

const logger = consola.withScope('nuxt:nuxtent')

export default function nuxtentModule(moduleOptions) {
  const nuxtentConfig = loadConfig(moduleOptions, this.options)
  // TODO: Refactor arguments in order to simplify this
  const routesOptions = {
    contentDir: nuxtentConfig.build.contentDir,
    content: nuxtentConfig.content,
    isDev: this.nuxt.options.dev
  }
  this.nuxt.hook('build:before', builder => {
    nuxtentConfig.isStatic = builder.isStatic
    logger.info(
      `Nuxtent Initiated in ${
        nuxtentConfig.isStatic ? 'static' : 'dynamic mode'
      }`
    )
    // Add `$content` helper
    this.addPlugin({
      src: join(__dirname, '..', 'plugins', 'requestContent.template.js'),
      fileName: 'nuxtent.js',
      options: nuxtentConfig
    })
    // Build dynamic content pages without components (*.md)
    buildContent(
      this,
      nuxtentConfig.build.buildDir,
      nuxtentConfig.isStatic,
      routesOptions
    )
  })
  this.nuxt.hook('build:done', () => {
    if (nuxtentConfig.isStatic) {
      logger.info('opening server connection')

      const app = express()
      logger.info(
        `prefix: ${nuxtentConfig.api.apiServerPrefix} baseurl: ${
          nuxtentConfig.api.baseURL
        }`
      )
      app.use(
        nuxtentConfig.api.apiServerPrefix,
        createRouter(
          nuxtentConfig.api.baseURL,
          nuxtentConfig.api.apiServerPrefix,
          routesOptions
        )
      )
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
    handler: createRouter(
      nuxtentConfig.api.baseURL,
      nuxtentConfig.api.apiServerPrefix,
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
    fileName: 'markdownComponents.js',
    options: {
      contentDirWebpackAlias: '~/content'
    }
  })
}

export { pkg as meta }
