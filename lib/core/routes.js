const { join } = require('path')

/**
 * For every route specified under a registered directory,
 * changes route path to comply with content's permalink configuration.
 *
 */
export function interceptRoutes (routes, options) {
  // get routes and permalink pair for every registered directory
  const contentRoutePaths =  {}
  options.dirs.forEach(registeredType => {
    const dirOpts = registeredType[1] || {}
    const routeName = dirOpts.routeName || options.routeName
    if (routeName === '') return // don't add route
    const path = join('/' + dirOpts.permalink || options.permalink)
    contentRoutePaths[routeName] = path
  })

  // if routes match, change path to the content's permalink
  routes.forEach(route => {
    if (contentRoutePaths[route.name]) {
      route.path = contentRoutePaths[route.name]
    }
  })
}

/**
 * Returns route paths for all content pages.
 */
export function getRoutes (contentMap) {
  const contentRoutes = []
  contentMap.forEach(contentDirMap => {
    contentDirMap.forEach(pageData => {
      contentRoutes.push(pageData.permalink)
    })
  })
  return contentRoutes
}
