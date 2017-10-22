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
        'anchors',
        'attributes',
        'body'
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
          cached.path = join(matchedPath[1], permalink)
        } else {
          cached.path = permalink
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
        cached.permalink = join(
          '/',
          toPermalink(params, { pretty: true }).replace(/%2F/gi, '/')
        ) // make url encoded slash pretty
      }
      return cached.permalink
    },

    get anchors() {
      if (isDev || !cached.anchors) {
        if (meta.fileName.search(/\.md$/) > -1) {
          const { _rawData } = this
          const level = options.anchorsLevel

          const anchorsExp = new RegExp(
            [
              '(`{3}[\\s\\S]*?`{3}|`{1}[^`].*?`{1}[^`]*?)', // code snippet
              `(#{${level + 1},})`, // other heading
              `(?:^|\\s)#{${level}}[^#](.*)` // heading text
            ].join('|'),
            'g'
          )

          let result
          const anchors = []
          while ((result = anchorsExp.exec(_rawData))) {
            // eslint-disable-next-line no-unused-vars
            const [match, codeSnippet, otherHeading, headingText] = result
            if (!(codeSnippet || otherHeading) && headingText) {
              const anchor = `#${paramCase(headingText)}`
              anchors.push([anchor, headingText])
            }
          }
          cached.anchors = anchors
        } else {
          // yaml file
          cached.anchors = []
        }
      }
      return cached.anchors
    },

    get attributes() {
      return this._rawData.attributes
    },

    get body() {
      if (isDev || !cached.body) {
        const { _rawData } = this
        const { parsers } = options
        const { dirName, section, fileName } = meta
        if (fileName.search(/\.comp\.md$/) > -1) {
          const relativePath = '.' + join(dirName, section, fileName)
          cached.body = {
            relativePath // component body compiled by loader and imported separately
          }
        } else if (fileName.search(/\.md$/) > -1) {
          cached.body = parsers
            .mdParser(parsers.md, options)
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
    }
  }
}
