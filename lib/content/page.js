import { join } from 'path'
import { readFileSync, statSync } from 'fs'

import fm from 'front-matter'
import dateFns from 'date-fns'
import paramCase from 'param-case'
import pathToRegexp from 'path-to-regexp'

const permalinkCompiler = pathToRegexp.compile

const getSlug = fileName => {
  const onlyName = fileName
    .replace(/(\.comp)?(\.[0-9a-z]+$)/, '') // remove any ext
    .replace(/!?(\d{4}-\d{2}-\d{2}-)/, '') // remove date and hypen
  return paramCase(onlyName)
}

const splitDate = date => {
  const [year, month, day] = date.split('-')
  return {
    year,
    month,
    day
  }
}

export default function prepPage(meta, options, isDev) {
  const cached = {}
  return {
    create(params = {}) {
      const props = new Set([
        'meta',
        'date',
        'path',
        'permalink',
        'attributes',
        'body',
        'toc'
      ])

      if (params.exclude) {
        params.exclude.split(',').forEach(prop => {
          if (props.has(prop)) {
            props.delete(prop)
          }
        })
      }

      let data = {}
      props.forEach(prop => {
        if (prop === 'attributes') {
          data = { ...this[prop], ...data }
        } else {
          data[prop] = this[prop]
        }
      })

      return data
    },

    get meta() {
      const cleanedMeta = Object.assign({}, meta)
      delete cleanedMeta.filePath
      return cleanedMeta
    },

    get path() {
      const { permalink } = this
      if (!options.page) {
        return permalink
      }
      if (isDev || !cached.path) {
        const nestedPath = /([^_][a-zA-z]*?)\/[^a-z_]*/
        const matchedPath = options.page.match(nestedPath)
        if (matchedPath && matchedPath[1] !== 'index') {
          cached.path = join(matchedPath[1], permalink).replace(/\\|\/\//, '/')
        } else {
          cached.path = permalink.replace(/\\|\/\//, '/')
        }
      }
      return cached.path
    },

    get permalink() {
      if (isDev || !cached.permalink) {
        const { date } = this
        const { section, fileName } = meta
        const slug = getSlug(fileName)
        const { year, month, day } = splitDate(date)
        const params = { section, slug, date, year, month, day }
        const toPermalink = permalinkCompiler(options.permalink)
        let permalink = join(
          '/',
          toPermalink(params, { pretty: true }).replace(/%2F/gi, '/') // make url encoded slash pretty
        )
        // Handle permalinks for subdirectory indexes
        if (permalink.length > 6 && permalink.substr(-6) === '/index') {
          permalink = permalink.substr(0, permalink.length - 6)
        }
        cached.permalink = permalink.replace(/\\|\\\\/g, '/')
      }
      return cached.permalink
    },

    get attributes() {
      if (options.data !== false && typeof options.data === 'object') {
        return { ...this._rawData.attributes, ...options.data }
      }
      return this._rawData.attributes
    },

    get body() {
      if (isDev || !cached.body) {
        const { _rawData } = this
        const { parsers } = options
        const { dirName, section, fileName } = meta
        if (fileName.search(/\.comp\.md$/) > -1) {
          let relativePath = '.' + join(dirName, section, fileName)
          relativePath = relativePath.replace(/\\/, '/') // normalize windows path
          cached.body = {
            relativePath // component body compiled by loader and imported separately
          }
        } else if (fileName.search(/\.md$/) > -1) {
          cached.body = parsers
            .mdParser(parsers.md, options, this)
            .render(_rawData.body) // markdown to html
        } else if (fileName.search(/\.(yaml|yml)$/) > -1) {
          cached.body = parsers.yamlParser().render(_rawData.body) // yaml to json
        }
      }
      return cached.body
    },

    get date() {
      if (isDev || !cached.date) {
        const { filePath, fileName, section } = meta
        if (options.isPost) {
          const fileDate = fileName.match(/!?(\d{4}-\d{2}-\d{2})/) // YYYY-MM-DD
          if (!fileDate) {
            throw Error(`Post in "${section}" does not have a date!`)
          }
          cached.date = fileDate[0]
        } else {
          const stats = statSync(filePath)
          cached.date = dateFns.format(stats.ctime, 'YYYY-MM-DD')
        }
      }
      return cached.date
    },

    get _rawData() {
      if (isDev || !cached.data) {
        const source = readFileSync(meta.filePath).toString()
        if (meta.fileName.search(/\.md$/) > -1) {
          const { attributes, body } = fm(source)
          cached.data = { attributes, body }
        } else if (meta.fileName.search(/\.(yaml|yml)$/) > -1) {
          cached.data = { attributes: {}, body: source }
        }
      }
      return cached.data
    },

    set toc(entry) {
      const { permalink } = this
      if (typeof cached.toc === 'undefined') {
        cached.toc = {}
      }
      if (typeof cached.toc[permalink] === 'undefined') {
        cached.toc[permalink] = {
          topLevel: Infinity,
          items: {}
        }
      }
      if (typeof cached.toc[permalink].items[entry.slug] !== 'undefined') {
        return
      }

      const tocEntry = {
        level: parseInt(entry.tag.substr(1)),
        title: entry.title,
        link: '#' + entry.slug
      }
      if (tocEntry.level < cached.toc[permalink].topLevel) {
        cached.toc[permalink].topLevel = tocEntry.level
      }
      if (typeof cached.toc[permalink].items[entry.slug] === 'undefined') {
        cached.toc[permalink].items[entry.slug] = tocEntry
      }
    },

    get toc() {
      const { permalink } = this
      return cached.toc[permalink]
    }
  }
}
