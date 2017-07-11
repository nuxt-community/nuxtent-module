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
    const permalink = logRequest(req.params['0'], apiPrefix, baseURL)
    console.log('params ' + permalink)
    if (permalink === '/') { // request all pages from directory
      const allPages = Array.from(contentDirMap.values())
      send.success(JSON.stringify(allPages))
    } else { // request single page
      const filePath = serialize(permalink, options)
      if (contentDirMap.has(filePath)) {
        const page = contentDirMap.get(filePath)
        send.success(JSON.stringify(page))
      } else {
        send.success(JSON.stringify({ title: 'hello' }))
        // send.notFound()
      }
    }
  }
}

function logRequest (permalink, apiPrefix, baseURL) {
  console.log(`${chalk.blue(apiPrefix)} ${chalk.green('GET')} ${baseURL + permalink}`)
  return permalink
}
