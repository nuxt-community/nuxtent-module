const { join } = require('path')

export default ({ app, isServer }) => {
  const options = <%= JSON.stringify(options) %>

  /**
   * Serialize content request to endpoint.
   *
   * If a request is made in server, we provide api path. If it is made
   * in client, we provide the relative path to the location of content
   * in browser.
   *
   */
  const reqPath = (endpoint, params = '/') => { // TODO
    const allButFirstSlash = /(?!^\/)(\/)/g

    return options.isDev || isServer
      ? join(endpoint, params) // TODO project/project :(
      : join(endpoint, params.replace(allButFirstSlash, '.')) + '.json' // TODO do they need access to data or to compiled html
  }

  const fetchContent = (contentDir) => ({
    async get (permalink) { // single page
      if (typeof permalink !== 'string') throw Error(`Permalink must be a string.`)
      const path = reqPath(contentDir, permalink)
      console.log('axios path ' + path)
      const res = await app.$axios.get(path)

      // console.log(res)
      return res.data
    },

    async getAll () { // all pages
      // const res = await app.$axios.get(reqPath(contentDir))
      return res.data
    }
  })

  app.$content = contentDir => fetchContent(contentDir)
}
