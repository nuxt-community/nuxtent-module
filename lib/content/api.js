import { parse } from 'querystring'

import chalk from 'chalk'
import { Router } from 'express'

import createDatabase from './database'

const logRequest = (apiPrefix, url) => {
  console.log(`${chalk.blue(apiPrefix)} ${chalk.green('GET')} ${url}`)
}

const response = res => ({
  json(data) {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data), 'utf-8')
    console.log('\tResponse sent successfully.')
  },
  error(err) {
    res.statusCode = 500
    res.statusMessage = 'Internal Server Error'
    res.end(err.stack || String(err))
    console.log('\tFailed to send response.', err)
  },
  notFound() {
    res.statusCode = 404
    res.statusMessage = 'Not Found'
    res.end()
    console.log('\tPage not found.')
  }
})

const curryResponseHandler = (
  baseUrl,
  serverPrefix,
  endpoint,
  contentDir,
  dirOpts,
  isDev
) => {
  const db = createDatabase(contentDir, endpoint, dirOpts, isDev)

  return function sendContent(req, res) {
    const send = response(res)
    const permalink = req.params['0']
    // eslint-disable-next-line no-unused-vars
    const [_, queryStr] = req.url.match(/\?(.*)/) || []
    const { only, between, ...query } = parse(queryStr)

    logRequest(serverPrefix, baseUrl + permalink)

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

const createRouter = (baseUrl, serverPrefix, options) => {
  const router = Router()
  const { contentDir, content, parsers, isDev } = options

  // for multiple content types, show the content configuration in the root request
  if (!content['/']) {
    router.use(
      '/',
      new Router().get('/', (req, res) => {
        response(res).json({
          'content-endpoints': Object.keys(content)
        })
      })
    )
  }

  Object.keys(content).forEach(dirName => {
    const dirOpts = { ...content[dirName], parsers }

    const sendContent = curryResponseHandler(
      baseUrl,
      serverPrefix,
      dirName,
      contentDir,
      dirOpts,
      isDev
    )
    router.use(dirName, new Router().get('*', sendContent))
  })

  return router
}

export default createRouter
