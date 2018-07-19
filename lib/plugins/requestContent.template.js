function urlJoin(...elts) {
  var re1 = new RegExp('^\\/|\\/$', 'g')
  return elts.map(element => element.replace(re1, "")).join('/');
}
import Axios from 'axios'

const api = <%= JSON.stringify(options.api) %>

// TODO: Analizar posible exceso de memoria con el cache

const Content = class {
  constructor(isStatic, error) {
    this.isAPI = process.server || !isStatic
    this.isStatic = isStatic
    this.cache = {}
    const axios = Axios.create({
      baseURL: (process.server ? api.baseURL : api.browserBaseURL) + (this.isAPI ? api.apiServerPrefix : api.apiBrowserPrefix),
      timeout: 1000,
      headers: {'X-Custom-Header': 'foobar'}
    });
    this.$axios = axios
    this.queryString = ''
    this.contentDir = ''
    this.error = error
    this.states = {
      IDLE: 'IDLE',
      WORKING: 'WORKING',
    }
    this.state = this.states.IDLE
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
  async fetchContent(permalink, query = '') {
    this.state = this.states.WORKING

    // replace leading slash
    let apiPath
    if (this.isAPI) {
      apiPath = urlJoin(this.contentDir, permalink + query)
    } else {
      const allButFirstSlash = /(?!^\/)(\/)/g
      const serializedPermalink = permalink.replace(allButFirstSlash, '.')
      apiPath = urlJoin(this.contentDir, serializedPermalink) + '.json'
    }
    this.queryString = ''
    this.contentDir = ''
    this.state = this.states.IDLE
    console.log(`NUXTENT solicitando:` + apiPath );

    if (this.isStatic) {
      return (await this.$axios.get(apiPath)).data
    }
    if (!this.cache[apiPath]) {
      return this.cache[apiPath] = (await this.$axios.get(apiPath)).data
    }
    return this.cache[apiPath]
  }
  /**
   * $content la primera función que define de donde se traen las estas
   * @param {String} contentDir El directorio del contenido
   */
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
    <% if (options.debug) { %>
    console.log('nuxtent', 'get', this.self, permalink)
    <% } %>
    return this.fetchContent(permalink, '?' + this.queryString)
  }
  getBetween(permalink, num1or2, num2 = '') {
    const endpoint = this.isAPI ? '/' : '_between'
    const betweenQuery = 'between=' + [permalink, num1or2, num2].join(',')
    const fullQuery = '?' + betweenQuery + '&' + this.queryString
    <% if (options.debug) { %> console.log('nuxtent', 'getbetween', this.self) <% } %>
    return this.fetchContent(endpoint, fullQuery)
  }
  getOnly(startIndex, endIndex) {
    const endpoint = this.isAPI ? '/' : '_only'
    const onlyQuery = 'only=' + [startIndex, endIndex].join(',')
    const fullQuery = '?' + onlyQuery + '&' + this.queryString
    <% if (options.debug) { %> console.log('nuxtent', 'getonly', this.self) <% } %>
    return this.fetchContent(endpoint, fullQuery)
  }
  getAll() {
    const endpoint = this.isAPI ? '/' : '_all'
    <% if (options.debug) { %> console.log('nuxtent', 'getall', this.self) <% } %>
    return this.fetchContent(endpoint, '?' + this.queryString)
  }
}

export default ({ app, isStatic, hotReload, route, error }, inject) => {
  const isNotContentReq =
    hotReload ||
    route.fullPath.includes('__webpack_hmr?') ||
    route.fullPath.includes('.hot-update.')
  if (isNotContentReq) {
    return
  }
  const nuxtent = new Content(isStatic, error)
  inject('nuxtent', nuxtent)
  inject('content', a => nuxtent.requestMethod(a))
}
