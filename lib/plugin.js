import Vue from 'vue'

const { join } = require('path')

const mdComps = {}

function importAllMdComps (r) {
  r.keys().forEach(key => mdComps[key] = r(key))
}

Vue.component('nuxtent-body', {
  functional: true,
  props: {
    body: { required: true }
  },
  render (h, ctx) {
    const { body } = ctx.props
    if (typeof body === 'object') {
      const Component = mdComps[body.relativePath]
      return (
        <div>
          <Component />
        </div>
      )
    } else {
      return (
        <div>
          <div domPropsInnerHTML={ body }/>
        </div>
      )
    }
  }
})

export default ({ app, isClient, isServer }) => {
  const options = <%= JSON.stringify(options) %>

  importAllMdComps(require.context(
    <%= JSON.stringify(options.srcDirFromPlugin) %>, true, /\.comp\.md$/
  ))

  const cache = {}
  const isAPI = (options.isDev || isServer) && !process.env.IS_STATIC
  async function fetchContent (path, permalink) {
    if (isAPI) {
      const apiEndpoint = join(path, permalink)
      const { data } = await app.$axios.get(apiEndpoint)
      return data
    } else if (isClient) {
      const allButFirstSlash = /(?!^\/)(\/)/g
      const serializedPermalink = permalink.replace(allButFirstSlash, '.')
      const browserPath = join(path, serializedPermalink) + '.json'
      if (!cache[browserPath]) {
        const { data } = await app.$axios.get(browserPath)
        cache[browserPath] = data
      }
      return cache[browserPath]
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
      const endpoint = isAPI ? '/' : '_all'
      return await fetchContent(contentDir, endpoint)
    }
  })
}
