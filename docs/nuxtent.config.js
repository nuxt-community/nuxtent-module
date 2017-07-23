const Prism = require('prismjs')
const externalLinks = require('markdown-it-link-attributes')

module.exports = {
  content: {
    routeName: 'index-lesson',
    permalink: ':slug',
    isPost: false
  },

  parsers: {
    md: {
      highlight: (code, lang) => {
        return Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup)
      },
      use: [
        [externalLinks, {
          target: '_blank',
          rel: 'noopener'
        }]
      ]
    }
  },

  api: {
    baseURL: (isProd) => isProd ? 'https://nuxtent.now.sh' : 'http://localhost:3000'
  }
}
