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
    routes: function() {
      return axios.get('http://localhost:3000/content-api').then(res => {
        return res.data.map(page => page.path)
      })
    }
  }
}
