const Prism = require('prismjs')
const externalLinks = require('markdown-it-link-attributes')

module.exports = {
  content: {
    page: 'guide/_slug',
    permalink: ':slug',
    isPost: false,
    generate: ['get', 'getAll']
  },

  parsers: {
    md: {
      extend(config) {
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
  }
}
