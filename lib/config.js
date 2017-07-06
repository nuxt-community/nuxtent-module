const { resolve } = require('path')

module.exports = (config) => ({
  vars: {
    srcPath: config ? config.srcDir : './', // used as external or local plugin
    srcDir: 'content',
    layoutDir: 'layouts/content',
    layout: 'default',
    route: '',    // no route
    dirs: ['/'],  // all files
    permalink: ':slug',
    isPost: true,
    data: {}
  },
  // resolves externally
  loader: {
    test: /\.md$/,
    use: [
      {
        loader: 'vue-loader'
      },
      {
        loader: '@nuxtjs/content/lib/loader.js'
      }
    ]
  },
  // resolves locally
  plugin: resolve(__dirname, './plugin.js')
})
