const { join } = require('path')

/**
 * For every route specified under a registered directory, changes
 * route path to comply with the content's permalink configuration.
 *
 * @note We make the original route path an alias to comply
 */
export default function interceptRoutes (routes, content) {
  const contentRoutePaths =  {}
  Object.keys(content).forEach(dirName => {
    const { routeName, permalink } = content[dirName]
    if (!routeName) return
    contentRoutePaths[routeName] = join('/' + permalink)
  })

  routes.forEach(route => {
    if (contentRoutePaths[route.name]) {
      route.path = contentRoutePaths[route.name]
    }
  })
}
