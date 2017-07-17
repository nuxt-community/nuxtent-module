import Vue from 'vue'

const { join } = require('path')

const mdComps = {}

function importAllMdComps () {
  // TODO allow two possible paths
  const r =  require.context('../content', true, /\.comp\.md$/)
  r.keys().forEach(key => mdComps[key] = r(key))
}

importAllMdComps()

Vue.component('nuxt-body', {
  props: {
    body: { required: true }
  },
  render (h) {
    const { body } = this
    if (typeof body === 'object') {
      const Component = mdComps[body.relativePath]
      return (
        <div>
          <Component />
        </div>
      )
    } else {
      console.log(this.body)
      return (
        <div>
          <section domProps-innerHTML={ body } />
        </div>
      )
    }
  }
})

export default ({ app, isClient }) => {
  const options = <%= JSON.stringify(options) %>

  async function fetchContent (path, permalink = '/') {
    if (options.isDev) {
      const apiEndpoint = join(path, permalink)
      const { data } = await app.$axios.get(apiEndpoint)
      return data
    } else if (isClient) {
      const allButFirstSlash = /(?!^\/)(\/)/g
      const serializedPermalink = permalink.replace(allButFirstSlash, '.')
      const browserPath = join(path, serializedPermalink) + '.json'
      return app.$axios.get(browserPath).then(result => result.data)
    } else {
      return // static server build, user must fallback to payload
    }
  }

  app.$content = contentDir => ({
    async get (permalink) {
      if (typeof permalink !== 'string') throw Error(`Permalink must be a string.`)
      return await fetchContent(contentDir, permalink)
    },
    async getAll () {
      return await fetchContent(contentDir)
    }
  })
}
