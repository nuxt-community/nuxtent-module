import { join } from 'path'

import createDatabase from './database'
import { logger } from '../utils'
/** @typedef {import('../config').default} NuxtentConfig */
/**
 * @typedef {Object} NuxtRoute
 * @property {string} name The name of the route
 * @property {string} path The path of the route
 * @property {NuxtRoute[]} [children=[]] ChildRoutes
 */

/**
 * Builds a path for browsers
 * @param {string} permalink The Permalink
 * @param {string} section The section aka folder
 * @param {string} buildDir The container folder
 * // /content/<folder>
 * @returns {string} The path for the static json
 */
const buildPath = (permalink, section, buildDir) => {
  // browser build path
  // convert the permalink's slashes to periods so that
  // generated content is not overly nested
  const allButFirstSlash = /(?!^\/)\//g
  const filePath = permalink.replace(allButFirstSlash, '.')
  return join(buildDir, section, filePath) + '.json'
}

const asset = object => {
  // webpack asset
  const content = JSON.stringify(
    object,
    null,
    process.env.NODE_ENV === 'production' ? 0 : 2
  )
  return { source: () => content, size: () => content.length }
}

/**
 * Intercept the nuxt routes and map them to nuxtent, usefull for date routes
 * @param {*} moduleContianer - A map with all the routes
 * @param {Map} routePaths - A map with all the routes
 * @returns {void}
 */
export const interceptRoutes = (moduleContianer, routePaths) => {
  /**
   * Renames child routes
   * @param {NuxtRoute} route The route
   * @returns {void}
   */
  const renameRoutePath = (route) => {
    if (routePaths.has(route.name)) {
      const isOptional = route.path.match(/\?$/)
      let overwritedPath = routePaths.get(route.name)
      const match = overwritedPath.match(/\/(.*)/)
      if (match) {
        overwritedPath = match[1]
      }
      logger.debug(`Renamed ${route.name} path ${route.path} > ${overwritedPath}`)
      route.path = isOptional ? overwritedPath + '?' : overwritedPath
    } else if (route.children) {
      route.children.forEach(renameRoutePath)
    }
  }
  return moduleContianer.extendRoutes((routes) => routes.forEach(renameRoutePath))
}

export const addRoutes = (generateOptions, routeData) => {
  if (!generateOptions.routes) {
    generateOptions.routes = []
  }
  const { routes } = generateOptions
  if (Array.isArray(routes)) {
    generateOptions.routes = routes.concat(routeData)
  } else {
    throw new TypeError(`"generate.routes" must be an array`)
  }
}

export const addAssets = (nuxtOpts, assetMap) => {
  logger.debug('Adding routes as assets for production')
  nuxtOpts.build.plugins.push({
    apply(compiler) {
      compiler.plugin('emit', (compilation, cb) => {
        assetMap.forEach((page, buildPath) => {
          compilation.assets[buildPath] = asset(page)
        })
        cb()
      })
    }
  })
}
export function createContentDatabase(options) {
  const { contentDir, content, parsers } = options
  const database = new Map()
  Object.keys(content).forEach(dirName => {
    const dirOpts = { ...content[dirName], parsers }
    const db = createDatabase(contentDir, dirName, dirOpts)
    database.set(dirName, db)
  })
  return database
}

/**
 * Sets the static routes to generate
 * @param {NuxtentConfig} nuxtentConfig The nuxtent config
 * @param {Map<any, any>} contentDatabase The Map serving as database
 * @returns {void} nothing
 */
export function createStaticRoutes(
  nuxtentConfig,
  contentDatabase
) {
  const content = nuxtentConfig.content
  const buildDir = nuxtentConfig.build.buildDir
  Object.keys(content).forEach(dirName => {
    const { page, method } = content[dirName]
    const db = contentDatabase.get(dirName)
    method.forEach(reqType => {
      const req = {}
      if (typeof reqType === 'string') {
        req['method'] = reqType
      } else if (Array.isArray(reqType)) {
        const [reqMethod, reqOptions] = reqType
        req['method'] = reqMethod
        req['query'] = reqOptions.query ? reqOptions.query : {}
        req['args'] = reqOptions.args ? reqOptions.args : []
      }

      switch (req['method']) {
        case 'get': {
          if (!page) {
            throw new Error('You must specify a page path')
          }
          db.findAll(req['query']).forEach(page => {
            nuxtentConfig.staticRoutes.push(page.permalink)
            nuxtentConfig.assetMap.set(buildPath(page.permalink, dirName, buildDir), page)
          })
          break
        }
        case 'getAll':
          nuxtentConfig.assetMap.set(
            buildPath('_all', dirName, buildDir),
            db.findAll(req['query'])
          )
          break
        case 'getOnly':
          nuxtentConfig.assetMap.set(
            buildPath('_only', dirName, buildDir),
            db.findOnly(req['args'], req['query'])
          )
          break
        default:
          throw new Error(
            `The ${req['method']} is not supported for static builds.`
          )
      }
    })
  })
}
