import { join } from 'path'

import createDatabase from './database'

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
    .replace('/', '-')
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

const interceptRoutes = (nuxt, routePaths) => {
  nuxt.extendRoutes(routes => {
    routes.forEach(route => {
      if (routePaths.has(route.name)) {
        route.path = '/' + routePaths.get(route.name)
      } else if (route.children) {
        route.children.forEach(nestedRoute => {
          if (routePaths.has(nestedRoute.name)) {
            const isOptional = nestedRoute.path.match(/\?$/)
            if (isOptional) {
              nestedRoute.path = routePaths.get(nestedRoute.name) + '?'
            } else {
              nestedRoute.path = routePaths.get(nestedRoute.name)
            }
          }
        })
      }
    })
  })
}

const addRoutes = (nuxtOpts, routeData) => {
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

const addAssets = (nuxtOpts, assetMap) => {
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

/**
 * 1) Add content data to assets so that it can be statically requested.
 * 2) Adds dynamic content routes to nuxt generate so that pages can get built.
 */
const buildContent = (nuxt, buildDir, isStatic, options) => {
  const { contentDir, content, parsers, isDev } = options

  const routePages = [] // dynamic pages to create
  const routePaths = new Map() // paths to reconfigure
  const assetMap = new Map() // browser assets to generate

  Object.keys(content).forEach(dirName => {
    const { page, generate, permalink } = content[dirName]

    let name
    if (page) {
      name = routeName(page)
      routePaths.set(name, permalink.replace(/^\//, ''))
    }

    if (generate && isStatic) {
      const dirOpts = { ...content[dirName], parsers }
      const db = createDatabase(contentDir, dirName, dirOpts, isDev)

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
              if (dirOpts.generatePathPrefix) {
                routePages.push(
                  join(dirOpts.generatePathPrefix, page.permalink)
                )
              } else {
                routePages.push(page.permalink)
              }
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
    }
  })

  interceptRoutes(nuxt, routePaths)
  addRoutes(nuxt.options, routePages)
  addAssets(nuxt.options, assetMap)
}

export default buildContent
