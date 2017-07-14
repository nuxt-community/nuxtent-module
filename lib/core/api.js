import chalk from 'chalk'
import { createDatabase } from './database'
import { Router } from 'express'
import { serialize } from '../util/shared'
// import { response } from '../util/server'

const fs = require('fs')
const { join } = require('path')

export default function createRouter (registeredDirs) {
  const router = Router()
  Object.keys(registeredDirs).forEach(dirName => {
    const dirOpts = registeredDirs[dirName]
    const sendContent = curryResponseHandler(dirName, dirOpts)
    router.use(dirName, new Router().get('*', sendContent))
  })
  return router
}

function curryResponseHandler (endpoint, options) {
  const { srcPath, srcDir, baseURL, apiPrefix } = options

  const dirPath = join(srcPath, srcDir, endpoint)
  const { exists, find, findAll } = createDatabase(dirPath, options)
  return function sendContent (req, res) {
    const send = response(res)
    const permalink = req.params['0']
    logRequest(permalink, apiPrefix, baseURL)

    if (permalink === '/') { // request all pages from directory
      send.json(findAll())
    } else { // request single page
      if (exists(permalink)) send.json(find(permalink))
      else send.notFound()
    }
  }
}

export const response = (res) => ({
  json(data) {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data), 'utf-8')
    console.log(`   Response sent successfully.`)
  },
  error(err) {
    console.log(`   Failed to send response.`, error)
    res.statusCode = 500
    res.statusMessage = 'Internal Server Error'
    res.end(err.stack || String(err))
  },
  notFound() {
    console.log(`   Page not found.`)
    res.statusCode = 404
    res.statusMessage = 'Not Found'
    res.end()
  }
})

function logRequest (permalink, apiPrefix, baseURL) {
  console.log(`${chalk.blue(apiPrefix)} ${chalk.green('GET')} ${baseURL + permalink}`)
  return permalink
}
