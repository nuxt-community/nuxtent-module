import parseFile from './parser'

const { statSync } = require('fs')
const { join } = require('path')
const moment = require('moment')
const paramCase = require('param-case')
const permalinkCompiler = require('path-to-regexp').compile

export default function prepPage (meta, options) {
  const cached = {}

  return {
    create () {
      const { permalink, date, data, template } = this
      return {
        permalink,
        date,
        ...data,
      }
    },

    get data () {
      if (!cached.data) {
        const { dirPath, section, fileName } = meta
        cached.data = parseFile(join(dirPath, section), fileName)
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
        const { dirPath, fileName, section } = meta
        if (options.isPost) {
          const fileDate = fileName.match(/!?(\d{4}-\d{2}-\d{2})/) // YYYY-MM-DD
          if (!fileDate) throw Error(`Post in "${section}" does not have a date!`)
          cached.date = fileDate[0]
        } else {
          const stats = statSync(join(dirPath, fileName))
          cached.date = moment(stats.ctime).format('MM-DD-YYYY')
        }
      }
      return cached.date
    },

    get slug () {
      if (!cached.slug) {
        const { fileName } = meta
        const onlyName = fileName
          .replace(/(.)[^.]+$/, '') // remove ext
          .replace(/!?(\d{4}-\d{2}-\d{2}-)/, '') // remove date and hypen
        cached.slug = paramCase(onlyName)
      }
      return cached.slug
    },

    get section () {
      return meta.section
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
