import { Nuxt, Builder } from 'nuxt'
import request from 'request-promise-native'

import baseConfig from './nuxt.config'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000
process.env.PORT = process.env.PORT || 5060
process.env.NODE_ENV = 'production'

const url = path => `http://localhost:${process.env.PORT}${path}`
const get = path => request(url(path))

let nuxt

const commonBefore = (nuxtentConfig, config = {}) => async () => {
  const mergedConfig = {
    ...baseConfig({
      ...nuxtentConfig,
      api: {
        baseURL: `http://localhost:${process.env.PORT}`
      }
    }),
    ...config
  }

  // Build a fresh nuxt
  nuxt = new Nuxt(mergedConfig)
  await new Builder(nuxt).build()
  await nuxt.listen(process.env.PORT)
}

const commonAfter = async () => {
  // Close all opened resources
  await nuxt.close()
}

export { get, commonBefore, commonAfter }
