import chalk from 'chalk'
import { Router } from 'express'
import { serialize } from '../util/shared'
import { response } from '../util/server'

const fs = require('fs')

export default function createRouter (contentMap, options) {
  const router = Router()
  contentMap.forEach((contentDirMap, endpoint) => {
    if (endpoint === '/') endpoint = '_root_' // TODO
    const sendContent = curryResponseHandler(contentDirMap, endpoint, options)
    router.use(endpoint, new Router().get('*', sendContent))
  })
  return router
}

function curryResponseHandler (contentDirMap, endpoint, options) {
  const { baseURL, apiPrefix } = options
  return function sendContent (req, res) {
    const send = response(res)
    const permalink = request(req.params, apiPrefix, baseURL)

    if (permalink === '/') { // request all pages from directory
      const allPages = Array.from(contentDirMap.values())
      send.success(JSON.stringify(allPages))
    } else { // request single page
      const filePath = serialize(permalink, options)
      if (contentDirMap.has(filePath)) {
        const page = contentDirMap.get(filePath)
        send.success(JSON.stringify(page))
      } else {
        send.notFound()
      }
    }
  }
}

function request (params, apiPrefix, baseURL) {
  const permalink = params['0']
  console.log(`${chalk.blue(apiPrefix)} ${chalk.green('GET')} ${baseURL + permalink}`)
  return permalink
}
