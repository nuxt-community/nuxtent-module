import createDatabase from './database'

const { isArray, concat } = Array
const { join } = require('path')


const buildPath = (permalink, section, { srcDir }) => { // browser build path
  // convert the permalink's slashes to periods so that
  // generated content is not overly nested
  const allButFirstSlash = /(?!^\/)(\/)/g
  const filePath = permalink.replace(allButFirstSlash, '.')
  return join(srcDir, section, filePath) + '.json'
}


const asset = (object) => { // webpack asset
  const content = JSON.stringify(object, null, process.env.NODE_ENV === 'production' ? 0 : 2)
  return { source: () => content, size: () => content.length }
}

/**
 * 1) Add content data to assets so that it can be statically requested.
 * 2) Adds dynamic content routes to nuxt generate so that pages can get built.
 */
export default function buildContent ({ nuxt, registeredDirs, options }) {
  const { srcPath, srcDir } = options

  let dynamicRoutes = []
  let assetMap = new Map()
  Object.keys(registeredDirs).forEach(dirName => {
    const dirOpts = registeredDirs[dirName]
    const dirPath = join(srcPath, srcDir, dirName)
    const { findAll } = createDatabase(dirPath, dirOpts)
    findAll().forEach((page) => {
      dynamicRoutes.push({ route: page.permalink, payload: page })
      assetMap.set(buildPath(page.permalink, dirName, options), page)
    })
  })

  addDynamicRoutes(nuxt, dynamicRoutes)
  addAssets(nuxt, assetMap)
}

function addDynamicRoutes (nuxt, dynamicRoutes) {
  if (!('generate' in nuxt)) nuxt.generate = {}
  if (!('routes' in nuxt.generate)) nuxt.generate.routes = []
  const { routes } = nuxt.generate
  if (isArray(routes)) nuxt.generate.routes = routes.concat(dynamicRoutes)
  else throw new Error(`"generate.routes" must be an array`)
}

function addAssets (nuxt, assetMap) {
  nuxt.build.plugins.push({
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
