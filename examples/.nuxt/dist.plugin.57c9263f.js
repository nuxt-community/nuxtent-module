const { join } = require('path')

export default ({ app, isServer }) => {
  const options = {"isDev":true,"srcPath":"/Users/acastano/Sites/nuxt/nuxt-content/examples","srcDir":"/content","routeName":null,"permalink":":slug","isPost":true,"data":{"siteName":"Nuxt-Content"},"dirs":[["posts",{"routeName":"post","permalink":":year/:slug","data":{"category":"Posts"}}],["projects",{"routeName":"projects-name","permalink":"projects/:slug","isPost":false}]],"baseURL":"http://localhost:3000","browserPrefix":"/_nuxt/content","apiPrefix":"/content-api"}

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
