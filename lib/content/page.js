const { existsSync, readFileSync, statSync } = require('fs')
const { join } = require('path')
const fm = require('front-matter')
const moment = require('moment')
const paramCase = require('param-case')
const permalinkCompiler = require('path-to-regexp').compile

export default function prepPage (meta, options, isDev) {
  const cached = {}
  return {
    create () {
      // TODO IF 'data' option include all data, otherwise, only include listed data
      // need to configure that via api route parameters
      const { date, path, permalink, anchors, data } = this

      return {
        meta,
        date,
        path,
        permalink,
        anchors,
        ...data,
      }
    },

    get path () {
      const { permalink } = this
      if (!options.routes) return permalink
      const dynamicRoute = options.routes.find(route => route.method === 'get')
      const nestedPath = /([^_][a-zA-z]*?)\/[^a-z\_]*/
      const matchedPath = dynamicRoute.path.match(nestedPath)
      if (matchedPath) return join(matchedPath[1] + permalink)
      else return permalink
    },

    get permalink () {
      if (isDev || !cached.permalink) {
        const { date } = this
        const { section, fileName } = meta
        const slug = getSlug(fileName)
        const { year, month, day } = splitDate(date)
        const params = { section, slug, date, year, month, day }
        const toPermalink = permalinkCompiler(options.permalink)
        cached.permalink = join('/', toPermalink(params, { pretty: true })
          .replace(/%2F/gi, "/")) // make url encoded slash pretty
      }
      return cached.permalink
    },

    get anchors () {
      if (isDev || !cached.anchors) {
        if (meta.fileName.search(/\.md$/) > -1) {
          const { source } = this
          const level = options.anchorsLevel

          const anchorsExp = new RegExp([
            '(`{3}[\\s\\S]*?`{3}|`{1}[^`].*?`{1}[^`]*?)',   // code snippet
            `(#{${level + 1},})`,                           // other heading
            `(?:^|\\s)#{${level}}[^#](.*)`,                 // heading text
          ].join('|'), 'g')

          let result
          let anchors = []
          while (result = anchorsExp.exec(source)) {
            let [match, codeSnippet, otherHeading, headingText] = result
            if (!(codeSnippet || otherHeading) && headingText) {
              const anchor = `#${paramCase(headingText)}`
              anchors.push([anchor, headingText])
            }
          }
          cached.anchors = anchors
        } else { // yaml file
          cached.anchors = []
        }
      }
      return cached.anchors
    },

    get data () {
      if (isDev || !cached.data) {
        const { source } = this
        const { fileName } = meta
        const { parsers } = options
        if (fileName.search(/\.comp\.md$/) > -1) {
          const { attributes } = fm(source)
          const { dirName, section, fileName } = meta
          const relativePath = '.' +  join(dirName, section, fileName)
          cached.data = {
            ...attributes,
            body: { relativePath } // component body compiled by loader and imported separately
          }
        } else if (fileName.search(/\.md$/) > -1) {
          const { attributes, body } = fm(source)
          cached.data = {
            ...attributes,
            body: parsers.mdParser(parsers.md, options).render(body)
          }
        } else if (fileName.search(/\.yaml$/) > -1) {
          cached.data = {
            body: parsers.yamlParser().render(source)
          }
        }
      }
      return cached.data
    },

    get date () {
      if (isDev || !cached.date) {
        const { filePath, fileName, section } = meta
        if (options.isPost) {
          const fileDate = fileName.match(/!?(\d{4}-\d{2}-\d{2})/) // YYYY-MM-DD
          if (!fileDate) throw Error(`Post in "${section}" does not have a date!`)
          cached.date = fileDate[0]
        } else {
          const stats = statSync(filePath)
          cached.date = moment(stats.ctime).format('MM-DD-YYYY')
        }
      }
      return cached.date
    },


    get source () {
      if (isDev || !cached.source) {
        cached.source = readFileSync(meta.filePath).toString()
      }
      return cached.source
    }
  }
}

function getSlug (fileName) {
  const onlyName = fileName
    .replace(/(\.comp)?(\.[0-9a-z]+$)/, '') // remove any ext
    .replace(/!?(\d{4}-\d{2}-\d{2}-)/, '')  // remove date and hypen
  return paramCase(onlyName)
}

function splitDate (date) {
  const dateData = date.split('-')
  return  {
    year: dateData[0],
    month: dateData[1],
    day: dateData[2]
  }
}
