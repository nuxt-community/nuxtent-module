const Vue = require('vue')
const { join } = require('path')
const axios = require('axios')

export default ({ app }) => {
  const moduleOpts = <%= JSON.stringify(options) %>

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

function apiQuery (contentDir, options) {
  const queryBase = options.isStatic ? `${options.baseURL}/_nuxt` : options.baseURL
  return queryBase + options.apiPrefix + contentDir
}

function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr))
}
