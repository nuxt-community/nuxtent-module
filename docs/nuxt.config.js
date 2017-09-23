module.exports = {
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
  modules: ['nuxtent'],
  css: [
    'prismjs/themes/prism-coy.css',
    { src: '~/assets/sass/base.sass', lang: 'sass' }
  ],
  loading: { color: '#35495e' }
}
