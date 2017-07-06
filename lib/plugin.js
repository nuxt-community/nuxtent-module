// NOTE: Node API methods are relative to root directory, while the
// Webpack API methods are relative to Nuxt's '/plugin' directory.

const Vue = require('vue')
const { resolve } = require('path')

var contentData
var contentFiles = {}

function importAll(r) {
  r.keys().forEach(key => contentFiles[key] = r(key))
}

if (process.SERVER_BUILD) {
  const { existsSync } = require('fs')
  const contentConfig = require('@nuxtjs/content/lib/config.js')()

  // There are constraints to dynamic imports with webpack. The main
  // one being that all arguments must be literals.
  // see more at: https://webpack.js.org/guides/dependency-management/
  if (existsSync('./content'))
    importAll(require.context('../content'), true, /\.md$/)
  else if (existsSync('../content'))
    importAll(require.context('../../content'), true, /\.md$/)

  contentData = require('@nuxtjs/content/lib/content.js').getContent()
}



Vue.use(() => {
  Vue.mixin({
    methods: {
      $content(section) {
        const content = {}
        const requestedDir = '/posts'
        contentData[requestedDir].forEach(data => {
          const path = resolve(requestedDir, data.src)
          const component = contentFiles['.' + path] // webpack key path
          content[path] = component
        })
        return content
      }
    }
  })
})
