const Prism = require('prismjs')

module.exports = {
  api: {
    baseURL: (isProd) => isProd ? 'https://nuxtent.now.sh' : 'http://localhost:3000'
  },

  parser: {
    highlight: (code, lang) => {
      return Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup)
    }
  },

  content: {
    routeName: 'index-lesson',
    permalink: ':slug',
    isPost: false
  }
}
