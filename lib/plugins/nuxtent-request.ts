// @ts-ignore
// import config from './nuxtent-config'
import fetch, { RequestInit, Response } from 'node-fetch'
import { Nuxtent } from '../../types'
import { Nuxt } from '../../types/nuxt'
import { Context, ErrorParams } from '@nuxt/vue-app'
let config = {
  // Defaults
  api: {
    apiBrowserPrefix: '/_nuxt/content',
    apiServerPrefix: '/content-api',
    baseURL: 'http://localhost:3000',
    browserBaseURL: '',
    host: 'localhost',
    port: '3000',
  },
}
try {
  // tslint:disable-next-line: no-var-requires
  config = require('./nuxtent-config')
  // @ts-ignore
  config = config.default || config
  // tslint:disable-next-line: no-empty
} catch (error) {}
const api: Nuxtent.Config.Api = config.api
const DEBUG: boolean = true

// ------------------------------------------------------ //
// Simple JavaScript API wrapper
// https://stanko.github.io/simple-javascript-api-wrapper
// ------------------------------------------------------ //
class ApiError extends Error {
  public response: null
  public status: number
  private isObject: boolean
  constructor(message: string, data: any, status: number) {
    super(message)
    let response = null
    let isObject = false
    // We are trying to parse response
    try {
      response = JSON.parse(data)
      isObject = true
    } catch (e) {
      response = data
    }
    this.name = 'Nuxtent Error'
    this.response = response
    this.message = message
    this.status = status
    this.isObject = isObject
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ApiError.prototype)
  }
  public toString() {
    return `${this.message}\nResponse:\n${
      this.isObject ? JSON.stringify(this.response, null, 2) : this.response
    }`
  }
}
const jsonRoutes = process.static ? process.server : true
const API_URL =
  process.static && process.browser
    ? api.apiBrowserPrefix
    : process.browser
    ? api.apiServerPrefix
    : api.baseURL + api.apiServerPrefix

// API wrapper function
function fetchResource(path: string, userOptions: RequestInit = {}) {
  // Define default options
  const defaultOptions = {}
  // Define default headers
  const defaultHeaders = {}

  const options = {
    // Merge options
    ...defaultOptions,
    ...userOptions,
    // Merge headers
    headers: {
      ...defaultHeaders,
      ...userOptions.headers,
    },
  }

  // Build Url
  const url = path ? `${API_URL}/${path.replace(/^\//, '')}` : API_URL
  // Stringify JSON data
  // If body is not a file
  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body)
  }

  // Variable which will be used for storing response
  let response: any = null

  return (
    fetch(url, options)
      .then((responseObject: Response) => {
        // Saving response for later use in lower scopes
        response = responseObject

        // HTTP unauthorized
        if (response.status === 401) {
          // Handle unauthorized requests
          // Maybe redirect to login page?
        }

        // Check for error HTTP error codes
        if (response.status < 200 || response.status >= 300) {
          // Get response as text
          return response.text()
        }

        // Get response as json
        return response.json()
      })
      // "parsedResponse" will be either text or javascript object depending if
      // "response.text()" or "response.json()" got called in the upper scope
      .then(parsedResponse => {
        // Check for HTTP error codes
        if (response.status < 200 || response.status >= 300) {
          // Throw error
          throw parsedResponse
        }

        // Request succeeded
        return parsedResponse
      })
      .catch(error => {
        // Throw custom API error
        // If response exists it means HTTP error occured
        if (response) {
          throw new ApiError(
            `Request failed with status ${response.status}.`,
            { pemralink: url, error },
            response.status
          )
        } else {
          throw new ApiError(error.toString(), null, 500)
        }
      })
  )
}

// TODO: Analizar posible exceso de memoria con el cache

function urlJoin(...elts: string[]) {
  const re1 = new RegExp('^\\/|\\/$', 'g')
  return elts.map(element => element.replace(re1, '')).join('/')
}

// tslint:disable-next-line: max-classes-per-file
class Content {
  public isAPI: boolean
  public isStatic: boolean
  public cache: {
    [path: string]: any
  }
  public $fetch: typeof fetchResource
  public queryString: string
  public contentDir: string
  public nuxtError: any
  public states: { IDLE: string; WORKING: string }
  public state: string = 'IDLE'
  constructor(nuxtError: (params: ErrorParams) => void) {
    this.isAPI = process.static ? process.server : true
    this.isStatic = process.static
    this.cache = {}
    this.nuxtError = nuxtError

    this.$fetch = fetchResource
    this.queryString = ''
    this.contentDir = ''
    this.states = {
      IDLE: 'IDLE',
      WORKING: 'WORKING',
    }
  }
  public toQuery(options: Nuxtent.Query = {}) {
    const exclude = options.exclude
    if (!exclude) {
      return ''
    }
    if (Array.isArray(exclude)) {
      return 'exclude=' + exclude.join(',')
    }
    return 'exclude=' + exclude
  }

  get self() {
    return {
      cache: this.cache,
      contentDir: this.contentDir,
      queryString: this.queryString,
    }
  }
  public async fetchContent(permalink: string, query = '') {
    // replace leading slash
    let apiPath
    if (this.isAPI) {
      apiPath = urlJoin(this.contentDir, permalink + (query.startsWith('?') ? query : `?${query}`))
    } else {
      const allButFirstSlash = /(?!^\/)(\/)/g
      const serializedPermalink = permalink.replace(allButFirstSlash, '.')
      apiPath = urlJoin(this.contentDir, serializedPermalink) + '.json'
    }
    this.queryString = ''
    this.contentDir = ''
    if (!this.cache[apiPath]) {
      return (this.cache[apiPath] = await this.$fetch(apiPath)
        .then((data: object) => {
          return data
        })
        .catch(error => {
          throw error
        }))
    }
    this.state = this.states.IDLE
    return this.cache[apiPath]
  }
  /**
   * $content la primera función que define de donde se traen las estas
   * @param {String} contentDir El directorio del contenido
   */
  public requestMethod(contentDir: string) {
    this.queryString = ''
    this.contentDir = contentDir
    return this
  }
  public query(options = {}) {
    // per page query
    if (DEBUG) {
      // tslint:disable-next-line: no-console
      console.log('nuxtent', 'Query', this.self)
    }
    this.queryString = this.toQuery(options)
    return this
  }
  public get(permalink: string) {
    if (typeof permalink !== 'string') {
      throw Error(`Permalink must be a string.`)
    }
    if (DEBUG) {
      // tslint:disable-next-line: no-console
      console.log('nuxtent', 'Get', {query: this.queryString, permalink})
    }
    return this.fetchContent(permalink, this.queryString)
  }
  public getBetween(permalink: string, num1or2: number, num2 = '') {
    const endpoint = this.isAPI ? '/' : '_between'
    const betweenQuery = 'between=' + [permalink, num1or2, num2].join(',')
    const fullQuery = betweenQuery + '&' + this.queryString
    if (DEBUG) {
      // tslint:disable-next-line: no-console
      console.log('nuxtent', 'getBetween', {endpoint, fullQuery})
    }
    return this.fetchContent(endpoint, fullQuery)
  }
  public getOnly(startIndex: number | string, endIndex: number | string) {
    const endpoint = this.isAPI ? '/' : '_only'
    const onlyQuery = 'only=' + [startIndex, endIndex].join(',')
    const fullQuery = onlyQuery + '&' + this.queryString
    if (DEBUG) {
      // tslint:disable-next-line: no-console
      console.log('nuxtent', 'getonly', {endpoint, fullQuery})
    }
    return this.fetchContent(endpoint, fullQuery)
  }
  public getAll() {
    const permalink = this.isAPI ? '/' : '_all'
    if (DEBUG) {
      // tslint:disable-next-line: no-console
      console.log('nuxtent', 'getall', permalink)
    }
    return this.fetchContent(permalink, this.queryString)
  }
}

export default (
  { isStatic, isHMR, route, error }: Context,
  inject: (key: string, value: any) => void
) => {
  const isNotContentReq =
    isHMR ||
    route.fullPath.includes('__webpack_hmr?') ||
    route.fullPath.includes('.hot-update.')
  if (isNotContentReq) {
    return
  }
  const nuxtent = new Content(error)
  inject('nuxtent', nuxtent)
  inject('content', (contentDir: string) => nuxtent.requestMethod(contentDir))
}
