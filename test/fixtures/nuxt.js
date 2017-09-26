import { Nuxt, Builder, Generator } from 'nuxt'
import request from 'request-promise-native'
import express from 'express'
import serveStatic from 'serve-static'

import baseConfig from './nuxt.config'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000
process.env.PORT = process.env.PORT || 5060
process.env.NODE_ENV = 'production'

const url = path => `http://localhost:${process.env.PORT}${path}`
const get = path => request(url(path))

let nuxt
let server

const serve = () => {
  const app = express()

  app.use(serveStatic(nuxt.options.generate.dir))
  server = app.listen(process.env.PORT)
}

const stopServe = () => {
  server.close()
}

const commonBefore = (nuxtentConfig, config = {}) => async () => {
  const mergedConfig = {
    ...baseConfig(nuxtentConfig),
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

const generate = (nuxtentConfig, config = {}) => async () => {
  const mergedConfig = {
    ...baseConfig(nuxtentConfig),
    ...config
  }

  // Build a fresh nuxt
  nuxt = new Nuxt(mergedConfig)
  const builder = new Builder(nuxt)
  const generator = new Generator(nuxt, builder)
  await generator.generate()
  serve()
}

const generateAfter = async () => {
  await commonAfter()
  stopServe()
}

export { get, commonBefore, commonAfter, generate, generateAfter }
