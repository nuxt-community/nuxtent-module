const Prism = require('prismjs')
const externalLinks = require('markdown-it-link-attributes')

module.exports = {
  content: {
    permalink: ':slug',
    isPost: false,
    routes: [
      {
        path: 'guide/_slug',
        method: 'get'
      },
      {
        path: 'guide',
        method: 'getAll'
      }
    ]
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
    baseURL: process.env.NODE_ENV === 'production'
      ? 'https://nuxtent.now.sh'
      : 'http://localhost:3000'
  }
}
