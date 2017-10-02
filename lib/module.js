/* eslint-disable import/no-extraneous-dependencies */
import { resolve } from 'path'

/* covered by nuxt */
import express from 'express'

import pkg from '../package.json'

import ConfigManager from './configManager'
import createRouter from './content/api'
import buildContent from './content/build'

export default function ContentModule(moduleOpts) {
  const configManager = new ConfigManager(this.options, moduleOpts)
  const config = configManager.config

  // Add `$content` helper
  this.addPlugin({
    src: resolve(__dirname, 'plugins/requestContent.js')
  })

  // Add content API when running `nuxt` & `nuxt build` (development and production)
  const apiOptions = configManager.api()
  this.addServerMiddleware({
    path: apiOptions.serverPrefix,
    handler: createRouter(
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
  })

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

  // Add Vue templates generated from markdown with components (*.comp.md) to output build
  this.addPlugin({
    src: resolve(__dirname, 'plugins/markdownComponents.template.js'),
    options: {
      contentDirWebpackAlias: config.dirs.contentWebpack
    }
  })
}

export { pkg as meta }
