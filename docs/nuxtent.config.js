const Prism = require('prismjs')
const externalLinks = require('markdown-it-link-attributes')

module.exports = {
  content: {
    permalink: ':slug',
    isPost: false,
    routes: [
      {
        name: 'guide-slug',
        method: 'get'
      },
      {
        name: 'guide',
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
    baseURL: (isProd) => isProd && !(process.env.NODE_ENV === 'development')
      ? 'https://nuxtent.now.sh'
      : 'http://localhost:3000'
  }
}
