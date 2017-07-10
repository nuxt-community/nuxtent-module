import { Router } from 'express'

const fs = require('fs')

export default function createRouter (contentMap, options) {
  const router = Router()
  contentMap.forEach((contentDirMap, endpoint) => {
    if (endpoint === '/') endpoint = '_root_'
    const sendContent = curryResponseHandler(contentDirMap, endpoint)
    router.use(endpoint, new Router().get('*', sendContent))
  })
  return router
}

function curryResponseHandler (contentDirMap) {
  return function sendContent (req, res) {
    const key = req.params['0'] // permalink identifies content
    if (contentDirMap.has(key)) {
      const content = contentDirMap.get(key)
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(content), 'utf-8')
    } else {
      res.statusCode = 404
      res.statusMessage = 'Not Found'
      res.end()
    }
  }
}
