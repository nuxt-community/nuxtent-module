var Prism = require('prismjs')

module.exports = {
  head: {
    title: 'Nuxtent',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxtent Documentation' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  modules: [
    ['nuxtent', {
      highlight: (code, lang) => {
        return Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup)
      }
    }]
  ],
  css: [
    'prismjs/themes/prism-coy.css'
  ],
  loading: { color: '#35495e' }
}
