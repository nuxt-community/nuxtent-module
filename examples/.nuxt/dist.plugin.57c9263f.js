const Vue = require('vue')
const { join } = require('path')
const axios = require('axios')

export default ({ app }) => {
  const moduleOpts = {"baseURL":"http://localhost:3000","srcPath":"/Users/acastano/Sites/nuxt/nuxt-content/examples","srcDir":"/content","routeName":"","dirs":[["/",{"isPost":false}],["posts",{"routeName":"post","permalink":":year/:slug","data":{"category":"Posts"}}],["projects",{"routeName":"projects-name","permalink":"projects/:slug","isPost":false}]],"permalink":":slug","isPost":true,"data":{"siteName":"Nuxt-Content"},"isStatic":true,"apiPrefix":"/_nuxt//content"}

  const fetchContent = (url) => ({
    async get (permalink) { // single page
      if (typeof permalink !== 'string') throw Error(`Permalink must be a string.`)
      const { data } = await axios.get(url + permalink)
      return data
    },

    async getAll () { // all pages
      const { data } = await axios.get(url)
      return data
    }
  })

  app.$content = contentDir => fetchContent(apiQuery(contentDir, moduleOpts))
}


function apiURL (contentDir, options) {
  return options.isStatic
    ? `http://localhost:3000/_nuxt/` + options.srcDir + contentDir
    : options.baseURL + options.apiPrefix + contentDir
}
