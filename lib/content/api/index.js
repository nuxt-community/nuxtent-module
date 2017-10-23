import { parse } from 'querystring'

import chalk from 'chalk'
import { Router } from 'express'

/* import createDatabase from './database' */

const leadingSlashRemove = string => string.replace(/^\/+/g, '')

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
  db,
  baseUrl,
  serverPrefix,
  endpoint,
  contentDir,
  dirOpts,
  isDev
) => {
  return async function sendContent(req, res) {
    const send = response(res)
    const permalink = leadingSlashRemove(req.params['0'])
    const requestBaseUrl = leadingSlashRemove(req.baseUrl)
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
      try {
        console.log('req base: ', requestBaseUrl)
        console.log('permalink: ', permalink)
        const resource = await db.get(requestBaseUrl, permalink)
        send.json(resource.value)
      } catch (error) {
        send.notFound()
      }
      /*
      if (db.exists(permalink)) {
        send.json(db.find(permalink, query))
      } else {
        send.notFound()
      }
      */
    }
  }
}

const createRouter = (
  db,
  baseUrl,
  serverPrefix,
  contentDir,
  content,
  parsers,
  isDev
) => {
  const router = Router()

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
      db,
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
