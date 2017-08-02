import Vue from 'vue'

const { join } = require('path')

const options = <%= JSON.stringify(options) %>

const mdComps = {}

function importAllMdComps (r) {
  r.keys().forEach(key => mdComps[key] = r(key))
}

importAllMdComps(require.context(
  <%= JSON.stringify(options.srcDirFromPlugin) %>, true, /\.comp\.md$/
))

Vue.component('nuxtent-body', {
  functional: true,
  props: {
    body: { required: true }
  },
  render (h, ctx) {
   const { body } = ctx.props
   if (typeof body === 'object') {
      const MarkdownComponent = mdComps[body.relativePath]
      return ( <MarkdownComponent /> )
    } else {
      return ( <div domPropsInnerHTML={ body } /> )
    }
  }
})

export default ({ app, isClient, isServer }) => {
  const cache = {}
  const isAPI = (options.isDev || isServer) && !process.env.STATIC
  async function fetchContent (path, permalink) {
    if (isAPI) {
      const apiEndpoint = join(path, permalink)
      if (options.isDev || !cache[apiEndpoint]) {
         cache[apiEndpoint] = (await app.$axios.get(apiEndpoint)).data
      }
      return cache[apiEndpoint]
    } else if (isClient) {
      const allButFirstSlash = /(?!^\/)(\/)/g
      const serializedPermalink = permalink.replace(allButFirstSlash, '.')
      const browserPath = join(path, serializedPermalink) + '.json'
      if (!cache[browserPath]) {
        cache[browserPath] = (await app.$axios.get(browserPath)).data
      }
      return cache[browserPath]
    }
    else {
      return // static server build
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
