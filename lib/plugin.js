const Vue = require('vue')
const { join } = require('path')
const axios = require('axios')

export default ({ app }) => {
  const moduleOpts = <%= JSON.stringify(options) %>

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
  const queryBase = options.isStatic ? `${options.baseURL}/_nuxt` : options.baseURL
  return queryBase + options.apiPrefix + contentDir
}

function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr))
}
