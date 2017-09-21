import nuxtent from '../../lib/module'

export default (nuxtentConfig) => ({
  dev: false,
  render: {
    resourceHints: false
  },
  modules: [
    nuxtent
  ],
  nuxtent: nuxtentConfig
})
