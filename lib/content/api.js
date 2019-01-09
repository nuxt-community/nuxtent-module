import { parse } from 'querystring'

import { Router } from 'express'

import logger from '../util/debug'
const logRequest = (apiPrefix, url) => {
  logger.debug(`${apiPrefix} GET ${url}`)
}

const response = res => ({
  json(data) {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data), 'utf-8')
    logger.debug('\tResponse sent successfully.')
  },
  error(err) {
    res.statusCode = 500
    res.statusMessage = 'Internal Server Error'
    res.end(err.stack || String(err))
    logger.error('\tFailed to send response.', err)
  },
  notFound() {
    res.statusCode = 404
    res.statusMessage = 'Not Found'
    res.end()
    logger.error('\tPage not found.')
  }
})

const curryResponseHandler = (baseUrl, serverPrefix, db) => {
  return function sendContent(req, res) {
    const send = response(res)
    let permalink = req.params['0']
    permalink = permalink.replace(/\\|\/\//g, '/')

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

const createRouter = (baseUrl, serverPrefix, options, database) => {
  const router = Router()
  const { content } = options

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
    const db = database.get(dirName)
    const sendContent = curryResponseHandler(baseUrl, serverPrefix, db)
    router.use(dirName, new Router().get('*', sendContent))
  })

  return router
}

export default createRouter
