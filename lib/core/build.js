import { serialize } from './util'

const { isArray, concat } = Array

/**
 * Add content data to assets so that it can be statically requested
 * and adds dynamic content routes to nuxt generate so that pages can
 * get built.
 */
export default function buildContent(options) {
  const { nuxt, contentMap } = options

  const routePaths = []
  const assetMap = new Map()

  contentMap.forEach((contentDirMap, dirName) => {
    contentDirMap.forEach((pageData, permalink) => {
      assetMap.set(serialize(pageData.permalink, options), pageData)
      routePaths.push(pageData.permalink)
    })
  })

  addDynamicRoutes(nuxt, routePaths)
  addAssets(nuxt, assetMap)
}


function addDynamicRoutes(nuxt, routePaths) {
  if (!('generate' in nuxt)) nuxt.generate = {}
  if (!('routes' in nuxt.generate)) nuxt.generate.routes = []

  const { routes } = nuxt.generate
  if (isArray(routes)) routes.concat(routePaths)
  else throw new Error(`"generate.routes" must be an array`)
}

function addAssets(nuxt, assetMap) {
  nuxt.build.plugins.push({
    apply(compiler) {
      compiler.plugin('emit', (compilation, cb) => {
        assetMap.forEach((fileData, fileName) => {
          compilation.assets[fileName] = toAsset(fileData)
        })
        cb()
      })
    }
  })
}


function toAsset(object) {
  const content = JSON.stringify(object, null, process.env.NODE_ENV === 'production' ? 0 : 2)
  return { source: () => content, size: () => content.length }
}
