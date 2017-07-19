const Prism = require('prismjs')
const markdownAnchor = require('markdown-it-anchor')

module.exports = {
  content: {
    routeName: 'index-lesson',
    permalink: ':slug',
    isPost: false
  },

  parser: {
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

  api: {
    baseURL: (isProd) => isProd ? 'https://nuxtent.now.sh' : 'http://localhost:3000'
  }
}
