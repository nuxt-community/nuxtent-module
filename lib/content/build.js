import { join, sep } from 'path'
import consola from 'consola'

import createDatabase from './database'
const logger = consola.withScope('nuxt:nuxtent.build')

const buildPath = (permalink, section, buildDir) => {
  // browser build path
  // convert the permalink's slashes to periods so that
  // generated content is not overly nested
  const allButFirstSlash = /(?!^\/)\//g
  const filePath = permalink.replace(allButFirstSlash, '.')
  return join(buildDir, section, filePath) + '.json'
}

const routeName = routePath => {
  const firstSlash = /^\//
  return routePath
    .replace(firstSlash, '')
    .replace(sep, '-')
    .replace('_', '')
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
 * @param {ModuleContainer} - moduleContainer
 * @param {Map} routePaths - A map with all the routes
 */
export const interceptRoutes = (moduleContainer, routePaths) => {
  logger.debug('Mapping routes to nuxt')
  moduleContainer.extendRoutes(routes => {
    routes.forEach(route => {
      if (routePaths.has(route.name)) {
        const newPath = `/${routePaths.get(route.name)}`
        logger.debug(`Renamed path ${route.path} > ${newPath}`)
        route.path = newPath
      } else if (route.children) {
        route.children.forEach(({ name, path }) => {
          if (routePaths.has(name)) {
            const isOptional = path.match(/\?$/)
            let overwritedPath = routePaths.get(name)
            const match = overwritedPath.match(/\/(.*)/)
            if (match) {
              overwritedPath = match[1]
            }
            logger.debug(`Renamed ${name} path ${path} > ${overwritedPath}`)
            if (isOptional) {
              path = overwritedPath + '?'
            } else {
              path = overwritedPath
            }
          }
        })
      }
    })
  })
}

export const addRoutes = (nuxtOpts, routeData) => {
  if (!nuxtOpts.generate) {
    nuxtOpts.generate = {}
  }
  if (!nuxtOpts.generate.routes) {
    nuxtOpts.generate.routes = []
  }
  const { routes } = nuxtOpts.generate
  if (Array.isArray(routes)) {
    nuxtOpts.generate.routes = routes.concat(routeData)
  } else {
    throw new Error(`"generate.routes" must be an array`)
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
  const { contentDir, content, parsers, isDev } = options
  const database = new Map()
  Object.keys(content).forEach(dirName => {
    const dirOpts = { ...content[dirName], parsers }
    const db = createDatabase(contentDir, dirName, dirOpts, isDev)
    database.set(dirName, db)
  })
  return database
}

export function createStaticRoutes(
  nuxtentConfig,
  routePages,
  assetMap,
  contentDatabase
) {
  const content = nuxtentConfig.content
  const buildDir = nuxtentConfig.build.buildDir
  Object.keys(content).forEach(dirName => {
    const { page, generate } = content[dirName]
    const db = contentDatabase.get(dirName)
    generate.forEach(reqType => {
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
            routePages.push(page.permalink)
            assetMap.set(buildPath(page.permalink, dirName, buildDir), page)
          })
          break
        }
        case 'getAll':
          assetMap.set(
            buildPath('_all', dirName, buildDir),
            db.findAll(req['query'])
          )
          break
        case 'getOnly':
          assetMap.set(
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

/**
 * 1) Add content data to assets so that it can be statically requested.
 * 2) Adds dynamic content routes to nuxt generate so that pages can get built.
 */

/**
 * @description Generates the routes
 *
 * @export
 * @param {import('../util/config').NuxtentConfig} nuxtentConfig - The nuxtent configuration
 * @returns {Object}
 */
export function buildContent(nuxtentConfig) {
  const content = nuxtentConfig.content

  const routePages = [] // dynamic pages to create
  const routePaths = new Map() // paths to reconfigure
  const assetMap = new Map() // browser assets to generate

  Object.keys(content).forEach(dirName => {
    const { page, permalink } = content[dirName]
    let name
    if (page) {
      name = routeName(page)
      routePaths.set(name, permalink.replace(/^\//, ''))
    }
  })
  return Promise.resolve({ routePages, routePaths, assetMap })
}
