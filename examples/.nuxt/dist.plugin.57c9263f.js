const { join } = require('path')
const axios = require('axios')

export default ({ app }) => {
  const moduleOpts = {"srcPath":"/Users/acastano/Sites/nuxt/nuxt-content/examples","srcDir":"content","routeName":"","dirs":[["/",{"isPost":false}],["posts",{"routeName":"post","permalink":":year/:slug","data":{"category":"Posts"}}],["projects",{"routeName":"projects-name","permalink":"projects/:slug","isPost":false}]],"permalink":":slug","isPost":true,"data":{"siteName":"Nuxt-Content"},"apiPrefix":"/content-api","baseURL":"http://localhost:3000","isStatic":true}

  function fetchContent (apiQuery) {
    const contentMapProm = axios.get(apiQuery).then(res => jsonToMap(res.data))

    return {
      async get (path) { // return data for a single page based on matching permalink
        if (typeof path !== 'string') throw Error(`Permalink must be a string.`)
        const contentMap = await contentMapProm
        console.log(contentMap)
        return contentMap.get(path)
      },

      async getAll () { // return [key, value] pair for requested content
        const contentMap = await contentMapProm
        return [...contentMap]
      }
    }
  }

  app.$content = contentDir => fetchContent(apiQuery(contentDir, moduleOpts))
}


function apiQuery (contentDir, options) {
  const queryBase = options.isStatic ? `http://localhost:3000/_nuxt` : options.baseURL
  return queryBase + options.apiPrefix + contentDir
}

function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr))
}
