const Prism = require('prismjs')
const externalLinks = require('markdown-it-link-attributes')

module.exports = {
  content: {
    page: 'guide/_slug',
    permalink: '/guide/:slug',
    isPost: false,
    generate: ['get', 'getAll']
  },
  markdown: {
    extend: config => {
      config.highlight = (code, lang) => {
        return Prism.highlight(
          code,
          Prism.languages[lang] || Prism.languages.markup,
          lang
        )
      }
    },
    plugins: {
      externalLinks: [
        externalLinks,
        {
          target: '_blank',
          rel: 'noopener'
        }
      ]
    }
  }
}
