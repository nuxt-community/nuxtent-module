const Vue = require('vue')
const { join } = require('path')
const axios = require('axios')

export default ({ app }) => {
  const moduleOpts = {"srcPath":"/Users/acastano/Sites/nuxt/nuxt-content/examples","srcDir":"content","routeName":"","dirs":[["/",{"isPost":false}],["posts",{"routeName":"post","permalink":":year/:slug","data":{"category":"Posts"}}],["projects",{"routeName":"projects-name","permalink":"projects/:slug","isPost":false}]],"permalink":":slug","isPost":true,"data":{"siteName":"Nuxt-Content"},"apiPrefix":"/content-api","baseURL":"http://localhost:3000","isStatic":false}

  const fetchContent = (url) => ({
    async get (permalink) { // single page
      if (typeof permalink !== 'string') throw Error(`Permalink must be a string.`)
      const { data } = await axios.get(url + permalink)
      console.log(data)
      return data 
    },

    async getAll () { // all pages
      const { data } = await axios.get(url)
      return data
    }
  })


  app.$content = contentDir => fetchContent(apiQuery(contentDir, moduleOpts))
}


function apiQuery (contentDir, options) {
  const queryBase = options.isStatic ? `http://localhost:3000/_nuxt` : options.baseURL
  return queryBase + options.apiPrefix + contentDir
}

function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr))
}
