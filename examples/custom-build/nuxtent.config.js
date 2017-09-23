const Prism = require('prismjs')

module.exports = {
  content: {
    // basic content configuration
    permalink: ':slug',
    isPost: false
  },

  parser: {
    // custom parser options
    md: {
      highlight: (code, lang) => {
        return Prism.highlight(
          code,
          Prism.languages[lang] || Prism.languages.markup
        )
      }
    }
  },

  api: {
    // custom url for development and production builds
    baseURL: process.env.NODE_ENV
      ? 'https://production-url.now.sh'
      : 'http://localhost:3000'
  }
}
