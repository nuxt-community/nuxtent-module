import { join } from 'path'

function toQuery(options = {}) {
  const exclude = options.exclude
  if (!exclude) {
    return ''
  }

  if (Array.isArray(exclude)) {
    return 'exclude=' + exclude.join(',')
  }

  return 'exclude=' + exclude
}

export default ({ app, isStatic, hotReload, route }) => {
  const isNotContentReq =
    hotReload ||
    route.fullPath.includes('__webpack_hmr?') ||
    route.fullPath.includes('.hot-update.')
  if (isNotContentReq) {
    return
  }

  const isAPI = process.server || !isStatic
  const cache = {}

  async function fetchContent(path, permalink, query = '') {
    if (isAPI) {
      const apiEndpoint = join(path, permalink + query)
      if (!isStatic || !cache[apiEndpoint]) {
        cache[apiEndpoint] = (await app.$axios.get(apiEndpoint)).data
      }
      return cache[apiEndpoint]
    } else if (process.client) {
      const allButFirstSlash = /(?!^\/)(\/)/g
      const serializedPermalink = permalink.replace(allButFirstSlash, '.')
      const browserPath = join(path, serializedPermalink) + '.json'
      if (!cache[browserPath]) {
        cache[browserPath] = (await app.$axios.get(browserPath)).data
      }
      return cache[browserPath]
    } else {
      // static server build
    }
  }

  app.$content = function requestMethod(contentDir) {
    let query = ''
    return {
      query(options = {}) {
        // per page query
        query = toQuery(options)
        return this
      },
      get(permalink) {
        if (typeof permalink !== 'string') {
          throw Error(`Permalink must be a string.`)
        }
        return fetchContent(contentDir, permalink, '?' + query)
      },
      getBetween(permalink, num1or2, num2 = '') {
        const endpoint = isAPI ? '/' : '_between'
        const betweenQuery = 'between=' + [permalink, num1or2, num2].join(',')
        const fullQuery = '?' + betweenQuery + '&' + query
        return fetchContent(contentDir, endpoint, fullQuery)
      },
      getOnly(startIndex, endIndex) {
        const endpoint = isAPI ? '/' : '_only'
        const onlyQuery = 'only=' + [startIndex, endIndex].join(',')
        const fullQuery = '?' + onlyQuery + '&' + query
        return fetchContent(contentDir, endpoint, fullQuery)
      },
      getAll() {
        const endpoint = isAPI ? '/' : '_all'
        return fetchContent(contentDir, endpoint, '?' + query)
      }
    }
  }
}
