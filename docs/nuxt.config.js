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
  modern: true,

  build: {
    extractCSS: true,
    html: {
      minify: {
        collapseBooleanAttributes: true,
        decodeEntities: true,
        minifyCSS: true,
        minifyJS: false,
        processConditionalComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        trimCustomFragments: true,
        useShortDoctype: true
      }
    },
    terser: false,
    filenames: {
      chunk: ({ isDev }) => (isDev ? '[name].js' : '[name].[chunkhash].js')
    },
    babel: {
      presets: ({ isServer }) => [
        [
          require.resolve('@nuxt/babel-preset-app'),
          {
            buildTarget: isServer ? 'server' : 'client',
            // Incluir polyfills globales es mejor que no hacerlo
            // useBuiltIns: 'entry',
            // Un poco menos de código a cambio de posibles errores
            loose: true,
            // Nuxt quiere usar ie 9, yo no.
            targets: isServer ? { node: 'current' } : {}
          }
        ]
      ]
    },
    /*
     ** Run ESLint on save
     */
    extend (config, { isDev, isClient }) {
      // Arregla pnpm
      const babelLoader = config.module.rules.find(
        rule => rule.test.toString() === /\.jsx?$/.toString()
      )
      babelLoader.use[0].loader = require.resolve('babel-loader')
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
