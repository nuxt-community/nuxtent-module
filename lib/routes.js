const getPages = require('./content/getPages')

/**
 * Creates top level or nested route for files in registered content directories.
 */
module.exports = function addRoutes(routes, config) {
  const pagesData = getPages(config)

  if (!pagesData) return
  Object.keys(pagesData).forEach(filePath => {
    const data = pagesData[filePath]

    if (data.options.route === "/") { // Top level route
      routes.push(data.route)
    } else { // Nested route
      let routeFound = false
      routes.forEach(route => {
        const isRoute = route.path.indexOf(data.options.route) > -1
        if (isRoute) {
          routeFound = true
          if (!route.children) route.children = []
          route.children.push(data.route)
        }
      })
      if (!routeFound) throw Error(`${dir} route does not exists`)
    }
  })
}
