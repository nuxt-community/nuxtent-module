import nuxtent from '../../../lib/module'

export default nuxtentConfig => ({
  buildDir: '.nuxt',
  generate: {
    dir: '.dist',
    minify: false
  },
  dev: false,
  render: {
    resourceHints: false
  },
  modules: [nuxtent],
  nuxtent: {
    ...nuxtentConfig,
    api: {
      baseURL: `http://localhost:${process.env.PORT}`
    }
  }
})
