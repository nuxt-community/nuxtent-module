const Prism = require('prismjs')
const externalLinks = require('markdown-it-link-attributes')
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || '3000'

module.exports = {
  content: {
    page: 'guide/_slug',
    permalink: ':slug',
    isPost: false,
    generate: ['get', 'getAll']
  },

  parsers: {
    md: {
      extend (config) {
        config.highlight = (code, lang) => {
          return Prism.highlight(
            code,
            Prism.languages[lang] || Prism.languages.markup
          )
        }
      },
      plugins: [
        [
          externalLinks,
          {
            target: '_blank',
            rel: 'noopener'
          }
        ]
      ]
    }
  },
  api (isStatic) {
    return {
      baseURL: `http://${host}:${port}`,
      browserBaseURL: isStatic ? '//infiniti.dinamo.mx' : '/'
    }
  }
}
