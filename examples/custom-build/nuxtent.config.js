const Prism = require('prismjs')
const markdownAnchor = require('markdown-it-anchor')

// example extracted from docs
module.exports = {
  content: { // basic content configuration
    routeName: 'index-lesson',
    permalink: ':slug',
    isPost: false
  },

  parser: { // custom parser options
    md: {
      highlight: (code, lang) => {
        return Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup)
      },
      use: [
        [markdownAnchor, {
          level: 1,
          permalinkClass: 'nuxt-header-anchor'
        }]
      ]
    }
  },

  api: { // custom url for development and production builds
    baseURL: (isProd) => isProd ? 'https://nuxtent.now.sh' : 'http://localhost:3000'
  }
}
