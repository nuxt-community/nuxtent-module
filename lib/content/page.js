import parseFile from './parser'

const fs = require('fs')
const { join } = require('path')
const moment = require('moment')
const path = require('path')
const paramCase = require('param-case')
const permalinkCompiler = require('path-to-regexp').compile

export default function prepPage (meta, options) {
  let data
  let permalink
  let date
  let slug

  return {
    create () {
      const { data, date } = this
      return {
        meta,
        content: {
          ...data,
          date,
        },
        options
      }
    },

    get data () {
      if (!data) {
        const { dirPath, section, fileName } = meta
        data = parseFile(join(dirPath, section), fileName)
      }
      return data
    },

    get permalink () {
      if (!permalink) {
        const { date, slug, section } = this
        const { year, month, day } = splitDate(date)
        const params = { section, slug, date, year, month, day }
        const toPermalink = permalinkCompiler(options.permalink)
        permalink = '/' + toPermalink(params, { pretty: true })
          .replace(/%2F/gi, "/") // make url encoded slash pretty

      }
      return permalink
    },

    get date () {
      if (!date) {
        const { fileName, section } = meta
        if (options.isPost) {
          const fileDate = fileName.match(/!?(\d{4}-\d{2}-\d{2})/) // YYYY-MM-DD
          if (!fileDate) throw Error(`Post in "${section}" does not have a date!`)
          date = fileDate[0]
        } else {
          date = 'TODO!'
        }
      }
      return date
    },

    get slug () {
      if (!slug) {
        const { fileName } = meta
        const onlyName = fileName
          .replace(/(.)[^.]+$/, '') // remove ext
          .replace(/!?(\d{4}-\d{2}-\d{2}-)/, '') // remove date and hypen
        slug = paramCase(onlyName)
      }
      return slug
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
