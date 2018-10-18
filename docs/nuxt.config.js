import nuxtent from '../lib/module'

export default {
  head: {
    title: 'Nuxtent',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Nuxtent Documentation'
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  modules: ['../lib/module'],
  css: [
    'prismjs/themes/prism-coy.css',
    { src: '~/assets/sass/base.sass', lang: 'sass' }
  ],
  loading: { color: '#35495e' },
  watch: [],

  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isClient) {
        config.devtool = '#source-map'
      }
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: [/(node_modules)/, /.*\.md/]
        })
      }
    }
  }
}
