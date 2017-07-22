const { existsSync, readFileSync, statSync } = require('fs')
const { join } = require('path')
const fm = require('front-matter')
const moment = require('moment')
const paramCase = require('param-case')
const permalinkCompiler = require('path-to-regexp').compile

export default function prepPage (meta, options) {
  const cached = {}

  return { // TODO include permalink and anchors and is data injected?
    create () {
      const { permalink, date, data, template } = this
      return {
        meta,
        permalink,
        date,
        ...data,
      }
    },

    get data () {
      if (!cached.data) { // TODO inject additional data
        cached.data = parseFile(meta, options)
      }
      return cached.data
    },

    get permalink () {
      if (!cached.permalink) {
        const { date, slug, section } = this
        const { year, month, day } = splitDate(date)
        const params = { section, slug, date, year, month, day }
        const toPermalink = permalinkCompiler(options.permalink)
        cached.permalink = '/' + toPermalink(params, { pretty: true })
          .replace(/%2F/gi, "/") // make url encoded slash pretty

      }
      return cached.permalink
    },

    get date () {
      if (!cached.date) {
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

    get slug () {
      if (!cached.slug) {
        const { fileName } = meta
        const onlyName = fileName
          .replace(/(\.comp)?(\.[0-9a-z]+$)/, '') // remove any ext
          .replace(/!?(\d{4}-\d{2}-\d{2}-)/, '')  // remove date and hypen
        cached.slug = paramCase(onlyName)
      }
      return cached.slug
    },

    get section () {
      return meta.section
    }
  }
}



function parseFile(meta, options) {
  const { filePath, fileName } = meta
  const source = readFileSync(filePath).toString()
  if (fileName.search(/\.md/) > -1) return compileMd(source, meta, options)
  else if (fileName.search(/\.yaml/) > -1) return options.parsers.yaml(source)
}

function compileMd(source, { dirName, section, fileName }, { parsers }) {
  const { attributes, body } = fm(source)
  if (fileName.search(/\.comp\.md/) > -1) {
    const relativePath = '.' +  join(dirName, section, fileName)
    return {
      ...attributes,
      // component body is compiled by loader and imported seperately
      body: { relativePath }
    }
  } else {
    return {
      ...attributes,
      body: parsers.md.render(body)
    }
  }
}

function splitDate (date) {
  const dateData = date.split('-')
  return  {
    year: dateData[0],
    month: dateData[1],
    day: dateData[2]
  }
}
