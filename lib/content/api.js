import { join } from 'path'
import { parse } from 'querystring'

import chalk from 'chalk'
import { Router } from 'express'

import createDatabase from './database'

export default function createRouter(options) {
  const router = Router()

  // for multiple content types, show the content configuration in the root request
  if (!options.content['/']) {
    router.use(
      '/',
      new Router().get('/', (req, res) => {
        response(res).json({
          'content-endpoints': Object.keys(options.content)
        })
      })
    )
  }

  Object.keys(options.content).forEach(dirName => {
    const sendContent = curryResponseHandler(dirName, options)
    router.use(dirName, new Router().get('*', sendContent))
  })

  return router
}

function curryResponseHandler(endpoint, options) {
  const { sitePath, srcDir, api } = options

  const contentPath = join(sitePath, srcDir)

  const db = createDatabase(contentPath, endpoint, options)

  return function sendContent(req, res) {
    const send = response(res)
    const permalink = req.params['0']
    // eslint-disable-next-line no-unused-vars
    const [_, queryStr] = req.url.match(/\?(.*)/) || []
    const { only, between, ...query } = parse(queryStr)

    logRequest(permalink, api.serverPrefix, api.baseURL)

    if (permalink === '/') {
      // request multiple pages from directory
      if (between) {
        send.json(db.findBetween(between, query))
      } else if (only) {
        send.json(db.findOnly(only, query))
      } else {
        send.json(db.findAll(query))
      }
    } else {
      // request single page
      if (db.exists(permalink)) {
        send.json(db.find(permalink, query))
      } else {
        send.notFound()
      }
    }
  }
}

export const response = res => ({
  json(data) {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data), 'utf-8')
    console.log(`   Response sent successfully.`)
  },
  error(err) {
    console.log(`   Failed to send response.`, err)
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

function logRequest(permalink, apiPrefix, baseURL) {
  console.log(
    `${chalk.blue(apiPrefix)} ${chalk.green('GET')} ${baseURL + permalink}`
  )
  return permalink
}
