import createDatabase from './database'

const { isArray, concat } = Array
const { join } = require('path')

const buildPath = (permalink, section, { buildDir }) => { // browser build path
  // convert the permalink's slashes to periods so that
  // generated content is not overly nested
  const allButFirstSlash = /(?!^\/)\//
  const filePath = permalink.replace(allButFirstSlash, '.')
  return join(buildDir, section, filePath) + '.json'
}

const routeName  = (routePath) => {
  const firstSlash = /^\//
  return routePath.replace(firstSlash, '').replace('/', '-').replace('_', '')
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

  let routePages = []        // dynamic pages to create
  let routePaths = new Map() // paths to reconfigure
  let assetMap = new Map()   // browser assets to generate

  Object.keys(content).forEach(dirName => {
    const { page, generate, permalink } = content[dirName]
    const contentPath = join(sitePath, srcDir)

    if (!generate) return

    const db = createDatabase(contentPath, dirName, options)

    generate.forEach(reqType => {
      const req = {}
      if (typeof reqType === 'string') {
        req['method'] =  reqType
      } else if (Array.isArray(reqType)) {
        const [reqMethod, reqOptions] = reqType
        req['method'] = reqMethod
        req['query'] = reqOptions.query ? reqOptions.query : {}
        req['args'] = reqOptions.args ? reqOptions.args : []
      }

      switch (req['method']) {
        case 'get':
          if (!page) throw new Error('You must specify a page path')
          const name = routeName(page)
          const pathPrefix = getPrefix(name)
          routePaths.set(name, permalink.replace(/^\//, ''))
          db.findAll(req['query']).forEach((page) => {
            routePages.push(join(pathPrefix, page.permalink))
            assetMap.set(buildPath(page.permalink, dirName, options), page)
          })
          break
        case 'getAll':
          assetMap.set(
            buildPath('_all', dirName, options),
            db.findAll(req['query'])
          )
          break
        case 'getOnly':
          assetMap.set(
            buildPath('_only', dirName, options),
            db.findOnly(req['args'], req['query'])
          )
          break
        default:
          throw new Error(`The ${req['method']} is not supported for static builds.`)
      }
    })
  })

  interceptRoutes(nuxt, routePaths)
  addRoutes(nuxt.options, routePages)
  addAssets(nuxt.options, assetMap)
}

function interceptRoutes (nuxt, routePaths) {
  nuxt.extendRoutes(routes => {
    routes.forEach(route => {
      if (routePaths.has(route.name)) {
        route.path = join('/', routePaths.get(route.name))
      } else if (route.children) {
        route.children.forEach(nestedRoute => {
          if (routePaths.has(nestedRoute.name)) {
            const isOptional = nestedRoute.path.match(/\?$/)
            if (isOptional) nestedRoute.path = routePaths.get(nestedRoute.name) + '?'
            else nestedRoute.path = routePaths.get(nestedRoute.name)
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
