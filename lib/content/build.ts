import { join } from 'path'

import { logger } from '../utils'
import { Nuxtent } from '../../types'
import Database from './database'
import NuxtentConfig from '../config'
import { Nuxt } from '../../types/nuxt'

/**
 * Builds a path for browsers
 * @param {string} permalink The Permalink
 * @param {string} section The section aka folder
 * @param {string} buildDir The container folder
 * // /content/<folder>
 * @returns {string} The path for the static json
 */
const buildPath = (permalink: string, section: string, buildDir: string) => {
  // browser build path
  // convert the permalink's slashes to periods so that
  // generated content is not overly nested
  const allButFirstSlash = /(?!^\/)\//g
  const filePath = permalink.replace(allButFirstSlash, '.')
  return join(buildDir, section, filePath) + '.json'
}

const asset = (object: Nuxtent.Page.PublicPage | Nuxtent.Page.PublicPage[]) => {
  // webpack asset
  const content = JSON.stringify(
    object,
    null,
    process.env.NODE_ENV === 'production' ? 0 : 2
  )
  return { source: () => content, size: () => content.length }
}

export function addAssets(nuxtOpts: Nuxt.Options, assetMap: Nuxtent.AssetMap) {
  logger.debug('Adding routes as assets for production')
  nuxtOpts.build.plugins.push({
    apply(compiler) {
      compiler.plugin('emit', (compilation, cb) => {
        assetMap.forEach((page, path) => {
          compilation.assets[path] = asset(page)
        })
        cb()
      })
    },
  })
}

/**
 * Sets the static routes to generate
 * @param {NuxtentConfig} nuxtentConfig The nuxtent config
 * @param {Map<any, any>} contentDatabase The Map serving as database
 * @returns {void} nothing
 */
export function createStaticRoutes(nuxtentConfig: NuxtentConfig) {
  const contentDatabase = nuxtentConfig.database
  const content = nuxtentConfig.content
  const buildDir = nuxtentConfig.build.buildDir
  for (let [dirName, { page, method }] of content) {
    const db = contentDatabase.get(dirName)
    if (!db) {
      throw new Error(`Database not found ${dirName}`)
    }
    if (!page) {
      throw new Error('You must specify a page path ' + dirName)
    }
    if (!Array.isArray(method)) {
      // Compatibility fix
      method = [method]
    }
    method.forEach(reqType => {
      const req = {
        args: [],
        method: '',
        query: {},
      }
      if (typeof reqType === 'string') {
        req.method = reqType
      } else if (Array.isArray(reqType)) {
        const [reqMethod, reqOptions] = reqType
        // @ts-ignore
        req.args = reqOptions.args || []
        req.method = typeof reqMethod === 'string' ? reqMethod : reqMethod[0]
        req.query = reqOptions.query ? reqOptions.query : {}
      }

      switch (req.method) {
        case 'get':

          db.findAll(req.query).forEach(publicPage => {
            nuxtentConfig.staticRoutes.push(publicPage.permalink)
            nuxtentConfig.assetMap.set(
              buildPath(publicPage.permalink, dirName, buildDir),
              publicPage
            )
          })
          break
        case 'getAll':
          nuxtentConfig.assetMap.set(
            buildPath('_all', dirName, buildDir),
            db.findAll(req.query)
          )
          break
        case 'getOnly':
          nuxtentConfig.assetMap.set(
            buildPath('_only', dirName, buildDir),
            db.findOnly(req.args, req.query)
          )
          break
        default:
          logger.error(
            Error(`The ${req.method} is not supported for static builds.`)
          )
      }
    })
  }
}
