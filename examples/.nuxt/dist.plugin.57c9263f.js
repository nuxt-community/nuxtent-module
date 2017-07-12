const { join } = require('path')

export default ({ app, isServer }) => {
  const opts = {"isDev":true,"srcPath":"/Users/acastano/Sites/nuxt/nuxt-content/examples","srcDir":"/content","routeName":null,"dirs":[["/",{"isPost":false}],["posts",{"routeName":"post","permalink":":year/:slug","data":{"category":"Posts"}}],["projects",{"routeName":"projects-name","permalink":"projects/:slug","isPost":false}]],"permalink":":slug","isPost":true,"data":{"siteName":"Nuxt-Content"},"baseUrl":"http://localhost:3000","browserPrefix":"/_nuxt","apiPrefix":"/content-api"}

  app.$content = contentDir => fetchContent(contentDir)

  const fetchContent = (contentDir) => ({
    async get (permalink) { // single page
      if (typeof permalink !== 'string') throw Error(`Permalink must be a string.`)
      const res = await app.$axios.get(reqPath(contentDir, permalink))
      console.log(reqPath(contentDir, permalink))
      console.log(res)
      return res.data
    },

    async getAll () { // all pages
      const res = await app.$axios.get(reqPath(contentDir))
      return res.data
    }
  })

  const reqPath = (contentDir, permalink = '/') => { // TODO
    return opts.isDev || isServer
      ? '/posts/2015/1st'
      :'/content/2015.1st.json'
  }
}
