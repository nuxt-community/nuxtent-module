import { join } from 'path'
// <% if (options.retry) { %>import axiosRetry from 'axios-retry'<% } %>

const Content = class {
  constructor(isStatic, $axios) {
    this.isAPI = process.server || !isStatic
    this.cache = {}
    this.$axios = $axios
    this.queryString = ''
    this.contentDir = ''
  }
  toQuery(options = {}) {
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
      queryString: this.queryString,
      contentDir: this.contentDir,
    }
  }
  async fetchContent(path, permalink, query = '') {
    // replace leading slash
    permalink = permalink.replace(/\/$/, '')
    if (this.isAPI) {
      const apiEndpoint = join(path, permalink + query)
      if (!this.isStatic || !this.cache[apiEndpoint]) {
        this.cache[apiEndpoint] = (await this.$axios.get(apiEndpoint)).data
      }
      return this.cache[apiEndpoint]
    } else if (process.client) {
      const allButFirstSlash = /(?!^\/)(\/)/g
      const serializedPermalink = permalink.replace(allButFirstSlash, '.')
      const browserPath = join(path, serializedPermalink) + '.json'
      if (!this.cache[browserPath]) {
        this.cache[browserPath] = (await this.$axios.get(browserPath)).data
      }
      return this.cache[browserPath]
    } else {
      // static server build
    }
  }

  requestMethod(contentDir) {
    this.queryString = ''
    this.contentDir = contentDir
    return this
  }
  query(options = {}) {
    // per page query
    <% if (options.debug) { %> console.log('nuxtent', 'Query', this.self) <% } %>
    this.queryString = this.toQuery(options)
    return this
  }
  get(permalink) {
    if (typeof permalink !== 'string') {
      throw Error(`Permalink must be a string.`)
    }
    <% if (options.debug) { %> console.log('nuxtent', 'get', this.self) <% } %>
    return this.fetchContent(this.contentDir, permalink, '?' + this.queryString)
  }
  getBetween(permalink, num1or2, num2 = '') {
    const endpoint = this.isAPI ? '/' : '_between'
    const betweenQuery = 'between=' + [permalink, num1or2, num2].join(',')
    const fullQuery = '?' + betweenQuery + '&' + this.queryString
    <% if (options.debug) { %> console.log('nuxtent', 'getbetween', this.self) <% } %>
    return this.fetchContent(this.contentDir, endpoint, fullQuery)
  }
  getOnly(startIndex, endIndex) {
    const endpoint = this.isAPI ? '/' : '_only'
    const onlyQuery = 'only=' + [startIndex, endIndex].join(',')
    const fullQuery = '?' + onlyQuery + '&' + this.queryString
    <% if (options.debug) { %> console.log('nuxtent', 'getonly', this.self) <% } %>
    return this.fetchContent(this.contentDir, endpoint, fullQuery)
  }
  getAll() {
    const endpoint = this.isAPI ? '/' : '_all'
    <% if (options.debug) { %> console.log('nuxtent', 'getall', this.self) <% } %>
    return this.fetchContent(this.contentDir, endpoint, '?' + this.queryString)
  }
}

export default ({ app, isStatic, hotReload, route }, inject) => {
  const isNotContentReq =
    hotReload ||
    route.fullPath.includes('__webpack_hmr?') ||
    route.fullPath.includes('.hot-update.')
  if (isNotContentReq) {
    return
  }
  const nuxtent = new Content(isStatic, app.$axios)
  inject('nuxtent', nuxtent)
  inject('content', a => nuxtent.requestMethod(a))
}
