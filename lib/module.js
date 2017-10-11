import { resolve } from 'path'

/* eslint-disable import/no-extraneous-dependencies */
/* covered by nuxt */
/* import express from 'express' */

import pkg from '../package.json'

import ConfigManager from './configManager'
import createRouter from './content/api'
/* import buildContent from './content/build' */
import db from './content/database'
import { oneShot } from './content/watch'
import processFile from './content/injection/processFile'

const debug = require('debug')('nuxt:module:nuxtent:core')

async function getContent(db, config) {
  debug('getting content')
  const transformers = config.plugins.filter(
    item => typeof item.transform === 'function'
  )
  if (!transformers.length) {
    throw Error('Nuxtent expects at least a transform plugin')
  }
  const collectors = config.plugins.filter(
    item => typeof item.collect === 'function'
  )
  if (!collectors.length) {
    throw Error('Nuxtent expects at least a collector plugin')
  }

  const contentPath = config.dirs.content

  try {
    const files = oneShot(contentPath, config.plugins)
    console.log('files: ', files)
    await db.destroy()
    await Promise.all(
      files.map(file =>
        processFile({
          config,
          db,
          file,
          transformers,
          collectors
        })
      )
    )
  } catch (e) {
    debug(
      `no '${contentPath}' folder found. Please create and put files in this folder if you want the content to be accessible (eg: markdown or JSON files). `
    )
  }
}

export default function ContentModule(moduleOpts) {
  const configManager = new ConfigManager(this.options, moduleOpts)
  const config = configManager.config

  try {
    getContent(db, config)
  } catch (e) {}

  // Add `$content` helper
  this.addPlugin({
    src: resolve(__dirname, 'plugins/requestContent.js')
  })

  // Add content API when running `nuxt` & `nuxt build` (development and production)
  const apiOptions = configManager.api()
  this.addServerMiddleware({
    path: apiOptions.serverPrefix,
    handler: createRouter(
      db,
      apiOptions.baseURL,
      apiOptions.serverPrefix,
      config.dirs.content,
      config.content,
      config.parsers,
      config.isDev
    )
  })

  this.nuxt.plugin('build', builder => {
    const isStatic = builder.isStatic
    const apiOptionsForBuild = configManager.api(isStatic)
    /*
    // Add content API when running `nuxt generate`
    this.nuxt.plugin('generator', generator => {
      const app = express()
      app.use(
        apiOptionsForBuild.serverPrefix,
        createRouter(
          apiOptionsForBuild.baseURL,
          apiOptionsForBuild.serverPrefix,
          config.dirs.content,
          config.content,
          config.parsers,
          config.isDev
        )
      )
      const server = app.listen(apiOptionsForBuild.port)

      generator.plugin('generated', () => {
        server.close()
      })
    })
    */

    // Initialize axios module
    this.requireModule([
      '@nuxtjs/axios',
      {
        ...apiOptionsForBuild,
        baseURL: apiOptionsForBuild.baseURL + apiOptionsForBuild.serverPrefix,
        browserBaseURL:
          apiOptionsForBuild.browserBaseURL +
          (!isStatic
            ? apiOptionsForBuild.serverPrefix
            : apiOptionsForBuild.browserPrefix)
      }
    ])

    /*
    // Build dynamic content pages without components (*.md)
    buildContent(
      this,
      config.dirs.build,
      isStatic,
      config.dirs.content,
      config.content,
      config.parsers,
      config.isDev
    )
    */
  })

  /*
  // Generate Vue templates from markdown with components (*.comp.md)
  this.extendBuild(webpackConfig => {
    webpackConfig.module.rules.push({
      test: /\.comp\.md$/,
      use: [
        'vue-loader',
        {
          loader: resolve(__dirname, 'loader'),
          options: {
            componentsDir: config.dirs.components,
            extensions: config.componentTemplatesExtensions,
            content: config.content,
            parsers: config.parsers
          }
        }
      ]
    })
  })
  */

  // TODO / UNCOMMENT: Add Vue templates generated from markdown with components (*.comp.md) to output build
  // Add `nuxtent-body` vue component
  this.addPlugin({
    src: resolve(__dirname, 'plugins/markdownComponents.template.js'),
    options: {
      contentDirWebpackAlias: config.dirs.contentWebpack
    }
  })
}

export { pkg as meta }
