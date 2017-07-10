import chalk from 'chalk'
import { Router } from 'express'

const fs = require('fs')

export default function createRouter (contentMap, options) {
  const router = Router()
  contentMap.forEach((contentDirMap, endpoint) => {
    if (endpoint === '/') endpoint = '_root_' // TODO
    const sendContent = curryResponseHandler(contentDirMap, endpoint, options)
    router.get(endpoint, sendContent)
  })
  return router
}

function curryResponseHandler (contentDirMap, endpoint, options) {
  const { baseURL, apiPrefix } = options
  return function sendContent (req, res) {
    logRequest(apiPrefix, baseURL)
    const content = mapToJson(contentDirMap)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(content), 'utf-8')
  }
}


function mapToJson(map) {
  return JSON.stringify([...map])
}

function logRequest (apiPrefix, baseURL) {
  console.log(`${chalk.blue(apiPrefix)} ${chalk.green('GET')} ${baseURL}`)
}
