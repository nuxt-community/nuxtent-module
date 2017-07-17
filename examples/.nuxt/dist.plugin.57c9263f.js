import Vue from 'vue'

const { join } = require('path')

const mdComps = {}

function importAllMdComps () {
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
      return (
        <div>
          <section domProps-innerHTML={ body } />
        </div>
      )
    }
  }
})

export default ({ app, isClient }) => {
  const options = {"isDev":false,"srcPath":"/Users/acastano/Sites/nuxt/nuxt-content/examples","buildDir":"/content","srcDir":"/content","componentsDir":"/components","routeName":null,"permalink":":slug","isPost":true,"data":{"siteName":"Nuxt-Content"},"dirs":[["posts",{"routeName":"post","permalink":":year/:slug","data":{"category":"Posts"}}],["projects",{"routeName":"projects-name","permalink":"projects/:slug","componentDir":"components","isPost":false}]],"baseURL":"http://localhost:3000","apiPrefix":"/content-api","browserPrefix":"/_nuxt/content"}

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
