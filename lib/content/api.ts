import { logger } from '../utils'
import NuxtentConfig from '../config'
import { send, RequestHandler } from 'micro'
import {
  router,
  get,
  AugmentedRequestHandler,
  withNamespace,
} from 'microrouter'
import Database from './database'
import createServer from 'connect'
import { IncomingMessage, ServerResponse } from 'http'
import { Nuxtent } from '../../types'

function queryParse(query: { [k: string]: string }): Nuxtent.Query {
  const { exclude = '', args = '' } = query
  return {
    args: args.split(','),
    exclude: exclude.split(','),
  }
}

/**
 *  Sends a single response for a single item on a content group
 * @param db The database for the content group
 */
function itemResponse(
  db: Database,
  prefix: string,
  path: string
): AugmentedRequestHandler {
  return async (req, res) => {
    if (!req.url) {
      logger.error('There is no url on the request')
      return send(res, 500, 'No url')
    }
    const cleanRegex = new RegExp(`(^${prefix})|[/?]$`, 'g')
    const permalink = req.url.replace(cleanRegex, '').replace(path, '')

    if (!db.exists(permalink)) {
      logger.warn({ code: 404, requested: req.params, url: req.url })
      return send(res, 404, {
        links: db.pagesArr.map(page => page.permalink),
        message: 'Not Found in ' + db.dirPath,
        path,
        prefix,
        requested: permalink,
        url: req.url,
      })
    }

    try {
      const page = await db.find(permalink, queryParse(req.query))
      return send(res, 200, page)
    } catch (e) {
      return send(res, 500, {
        error: e,
        message: 'There is a server error',
        path,
        requested: permalink,
      })
    }
  }
}

/**
 * The fallback routing
 * @param database The whole map for all the content groups
 */
function indexResponse(
  database: Map<string, Database>
): AugmentedRequestHandler {
  // Cache the paths
  const basePaths = Array.from(database.keys())
  interface IFoundedDatabase {
    key?: string
    db: Database | null
  }
  function findDatabase(path: string): IFoundedDatabase {
    const result: IFoundedDatabase = {
      db: null,
      key: basePaths.find(value => {
        return value.indexOf(path) !== -1
      }),
    }
    if (result.key) {
      result.db = database.get(result.key) || null
    }
    return result
  }
  return async (req, res) => {
    const { key, db } = findDatabase(req.url || '/')
    if (key && db) {
      const result = await Promise.resolve({
        index: key,
        pages: Array.from(db.pagesMap.keys()),
      })
      return send(res, 200, result)
    }
    logger.warn('Page ' + req.url + ' not found.')
    return send(res, 404, {
      endpoints: basePaths,
      message: 'Not found',
      requested: req.url,
    })
  }
}

/**
 * Makes the string with a optional trailing slash
 * @param path The path to set the optional slash
 */
function trailingOptional(path: string): string {
  if (path.endsWith('/')) {
    // Make optional the trailing slash
    return path.replace(/\/$/, '(/)')
  }
  return path + '(/)'
}

function indexHandler(db: Database): AugmentedRequestHandler {
  return async (req, res) => {
    const { between, only } = req.query
    if (between) {
      return send(
        res,
        200,
        await db.findBetween(between, queryParse(req.query))
      )
    } else if (only) {
      return send(res, 200, await db.findOnly(only, queryParse(req.query)))
    } else {
      return send(res, 200, await db.findAll(queryParse(req.query)))
    }
  }
}

/**
 *  Instantiates the rotuter instance
 * @param nuxtentConfig The nuxtent config
 */
function createRouter(
  nuxtentConfig: NuxtentConfig
): createServer.NextHandleFunction {
  const routes: RequestHandler[] = []

  // for multiple content types, show the content configuration in the root request
  if (!nuxtentConfig.database.has('/')) {
    // Cache the result
    const contentEndpoints = Array.from(nuxtentConfig.database.keys())
    routes.push(
      get('/', (req, res) =>
        send(res, 200, {
          endpoints: contentEndpoints,
          message: 'Found',
        })
      )
    )
  }
  for (let [path, database] of nuxtentConfig.database) {
    if (!path.startsWith('/')) {
      path = '/' + path
    }
    // Generate the route match for each item
    const item = path + database.permalink
    routes.push(
      get(
        trailingOptional(item),
        itemResponse(database, nuxtentConfig.api.apiServerPrefix, path)
      )
    )
    const linkMatch = item.match(/:[\w]+/)
    const index = linkMatch ? item.substr(0, linkMatch.index) : path
    // Instantate just once
    const handler = indexHandler(database)
    // The index route
    routes.push(get(trailingOptional(index), handler))
    // If permaink base differs from the base route on the config then set both
    if (index !== path) {
      routes.push(get(trailingOptional(path), handler))
    }
  }
  routes.push(get('*', indexResponse(nuxtentConfig.database)))
  function nuxtentRouter(
    this: any,
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: any) => void
  ) {
    return router(...routes)(req, res)
  }

  nuxtentRouter.namespaced = () => {
    const api = withNamespace(nuxtentConfig.api.apiServerPrefix)
    // const prefixedRoutes = routes.map((fn) => api(fn))
    return router(api(...routes))
  }
  return nuxtentRouter
}

export default createRouter
