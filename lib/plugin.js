const { join } = require('path')

export default ({ app, isClient }) => {
  const options = <%= JSON.stringify(options) %>

  function fetchContent (path, permalink = '/') {
    if (options.isDev) {
      const apiEndpoint = join(path, permalink)
      return app.$axios.get(apiEndpoint).then(result => result.data)
    } else if (isClient) {
      const allButFirstSlash = /(?!^\/)(\/)/g
      const serializedPermalink = permalink.replace(allButFirstSlash, '.')
      const browserPath = join(path, serializedPermalink) + '.json'
      return app.$axios.get(browserPath).then(result => result.data)
    } else {
      return // static server build, user must fallback to payload
    }
  }

  app.$content = contentDir => ({
    async get (permalink) {
      if (typeof permalink !== 'string') throw Error(`Permalink must be a string.`)
      return await fetchContent(contentDir, permalink)
    },
    async getAll () {
      return await fetchContent(contentDir)
    }
  })
}
