const axios = require('axios')

module.exports = {
  modules: ['nuxtent', '@nuxtjs/sitemap'],
  nuxtent: {
    content: {
      page: '/_post',
      permalink: ':year/:slug',
      generate: [
        // assets to generate static build
        'get',
        'getAll'
      ]
    }
  },
  sitemap: {
    generate: true,
    routes: () => {
      return axios.get('http://localhost:3000/content-api').then(res => {
        return res.data['content-endpoints']
      }).then(endpoints => {
        return Promise.all(endpoints.map(endpoint => {
          return axios.get(`http://localhost:3000/content-api${endpoint}`)
        }))
      }).then(endpoints => {
        return endpoints.reduce((routes, endpoint) => {
          return routes.concat(endpoint.data.map(page => page.permalink))
        }, [])
      })
    }
  }
}
