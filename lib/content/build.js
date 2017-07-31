import createDatabase from './database'

const { isArray, concat } = Array
const { join } = require('path')

const buildPath = (permalink, section, { buildDir }) => { // browser build path
  // convert the permalink's slashes to periods so that
  // generated content is not overly nested
  const allButFirstSlash = /(?!^\/)(\/)/g
  const filePath = permalink.replace(allButFirstSlash, '.')
  return join(buildDir, section, filePath) + '.json'
}

const asset = (object) => { // webpack asset
  const content = JSON.stringify(object, null, process.env.NODE_ENV === 'production' ? 0 : 2)
  return { source: () => content, size: () => content.length }
}

/**
 * 1) Add content data to assets so that it can be statically requested.
 * 2) Adds dynamic content routes to nuxt generate so that pages can get built.
 */
export default function buildContent ({ nuxt, options }) {
  const { sitePath, srcDir, content } = options

  let routeData = []
  let dynamicRoutePaths = new Map()
  let assetMap = new Map()

  Object.keys(content).forEach(dirName => {
    const dirOpts = content[dirName]
    const contentPath = join(sitePath, srcDir)

    if (!dirOpts.routes) return
    const { findAll, query } = createDatabase(contentPath, dirName, options)

    dirOpts.routes.forEach(route => {
      if (!route.name || !route.method) throw new Error('Routes must have a name and a method')
      switch (route.method) {
        case 'get':
          const pathPrefix = getPrefix(route.name)
          dynamicRoutePaths.set(route.name, join('/', dirOpts.permalink))
          findAll().forEach((page) => {
            routeData.push({ route: join(pathPrefix, page.permalink), payload: page })
            assetMap.set(buildPath(page.permalink, dirName, options), page)
          })
          break
        case 'getAll':
          routeData.push({ route: join('/', route.name), payload: findAll() })
          assetMap.set(buildPath('_all', dirName, options), findAll())
          break
        // case 'query':
        //   break
        default:
          throw new Error(`Generate route method "${route.method}" does not exist.`)
      }
    })
  })
  interceptRoutes(nuxt, dynamicRoutePaths)
  addRoutes(nuxt.options, routeData)
  addAssets(nuxt.options, assetMap)
}

function interceptRoutes (nuxt, routePaths) {
  nuxt.extendRoutes(routes => {
    routes.forEach(route => {
      if (routePaths.has(route.name)) {
        route.path = routePaths.get(route.name)
      } else if (route.children) {
        route.children.forEach(nestedRoute => {
          if (routePaths.has(nestedRoute.name)) {
            nestedRoute.path = routePaths.get(nestedRoute.name)
          }
        })
      }
    })
  })
}

function addRoutes (nuxtOpts, routeData) {
  if (!('generate' in nuxtOpts)) nuxtOpts.generate = {}
  if (!('routes' in nuxtOpts.generate)) nuxtOpts.generate.routes = []
  const { routes } = nuxtOpts.generate
  if (isArray(routes)) nuxtOpts.generate.routes = routes.concat(routeData)
  else throw new Error(`"generate.routes" must be an array`)
}

function addAssets (nuxtOpts, assetMap) {
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

function getPrefix (routeName, topLevelPrefix = '/') {
  const result = routeName.match(/(^[a-zA-Z]*)(-)/) // matches `prefix-`
  if (result) {
    const [_, prefix] = result
    if (prefix !== 'index') return join('/', prefix)
  }
  return topLevelPrefix
}
