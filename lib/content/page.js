import { join } from 'path'
import { readFileSync, statSync } from 'fs'

import matter from 'gray-matter'
import dateFns from 'date-fns'
import _ from 'lodash'
import pathToRegexp from 'path-to-regexp'
import yaml from 'js-yaml'
import { slugify } from '../utils'
// import { logger } from '../utils'

/** @typedef {import('./database').NuxtentFileMeta} NuxtentFileMeta */
/** @typedef {import('../config').NuxtentConfigContent} NuxtentConfigContent */

/**
 * @typedef {Object} NuxtentPageData The page data
 * @property {*} [meta]
 * @property {string} [date]
 * @property {string} [path]
 * @property {string} [permalink]
 * @property {Object} [attributes]
 * @property {Object} [toc]
 * @property {Object} [data]
 * @property {Object|string} [body]
 */

const permalinkCompiler = pathToRegexp.compile

/**
 * Creates a slug
 * @param {string} fileName The file name
 * @returns {string} the slugified string
 */
const getSlug = fileName => {
  const onlyName = slugify(fileName)
    .replace(/(\.comp)?(\.[0-9a-z]+$)/, '') // remove any ext
    .replace(/!?(\d{4}-\d{2}-\d{2}-)/, '') // remove date and hypen
  return _.kebabCase(onlyName)
}

/**
 * Converts the date of the post into object
 * @param {string} date The date
 * @returns {{year: string, month: string, day: string}} The date object
 */
const splitDate = date => {
  const [year, month, day] = date.split('-')
  return {
    year,
    month,
    day
  }
}

const isDev = process.env.NODE_ENV !== 'production'
export default class Page {
  /**
   * @typedef {'meta' | 'date' | 'path' | 'permalink' | 'attributes' | 'body' | 'toc'} NuxtentPageProp
   */
  /**
   * Creates an instance of Page.
   * @param {NuxtentFileMeta} meta The metadata for the page file
   * @param {NuxtentConfigContent} contentConfig The content configuration
   *
   * @memberOf Page
   */
  constructor(meta, contentConfig) {
    /**
     * @type NuxtentPageData
     */
    this.cached = {}
    this.__meta = meta
    this.__config = contentConfig
    /**
     * @type {NuxtentPageProp[]}
     */
    this.propsSet = ['meta', 'date', 'path', 'permalink', 'attributes', 'body']
    if (contentConfig.toc !== false) {
      this.propsSet.push('toc')
    }
  }
  /**
   * @description Creates an instance of the page
   *
   * @param {Object} [params={}] Params
   * @param {NuxtentPageProp[]} [params.exclude] The props exclution list
   * @returns  {Object} The page content
   *
   * @memberOf Page
   */
  create(params = {}) {
    const props = new Set(this.propsSet)

    if (params.exclude) {
      params.exclude.forEach(prop => {
        if (props.has(prop)) {
          props.delete(prop)
        }
      })
    }

    /**
     * @type {Object}
     * @property {*} [meta]
     * @property {Date} [date]
     * @property {string} [path]
     * @property {string} [permalink]
     * @property {Object} [attributes]
     * @property {Object|string} [body]
     */
    const data = {}
    props.forEach(prop => {
      if (prop === 'attributes') {
        Object.assign(data, this[prop])
      } else {
        data[prop] = this[prop]
      }
    })

    return data
  }
  get meta() {
    const cleanedMeta = Object.assign({}, this.__meta)
    delete cleanedMeta.filePath
    return cleanedMeta
  }
  get path() {
    const { permalink } = this
    if (!this.__config.page) {
      return permalink
    }
    if (isDev || !this.cached.path) {
      const nestedPath = /([^_][a-zA-z]*?)\/[^a-z_]*/
      const matchedPath = this.__config.page.match(nestedPath)
      if (matchedPath && matchedPath[1] !== 'index') {
        this.cached.path = join(matchedPath[1], permalink).replace(/\\|\/\//, '/')
      } else {
        this.cached.path = permalink.replace(/\\|\/\//, '/')
      }
    }
    return this.cached.path
  }

  get permalink() {
    if (isDev || !this.cached.permalink) {
      const { date } = this
      const { section, fileName } = this.meta
      const slug = getSlug(fileName)
      const { year, month, day } = splitDate(date)
      const params = { section, slug, date, year, month, day }
      const toPermalink = permalinkCompiler(this.__config.permalink)
      let permalink = join(
        '/',
        toPermalink(params, { pretty: true }).replace(/%2F/gi, '/') // make url encoded slash pretty
      )
      // Handle permalinks for subdirectory indexes
      if (permalink.length > 6 && permalink.substr(-6) === '/index') {
        permalink = permalink.substr(0, permalink.length - 6)
      }
      this.cached.permalink = permalink.replace(/\\|\\\\/g, '/')
    }
    return this.cached.permalink
  }
  get attributes() {
    if (typeof this.__config.data === 'object') {
      return { ...this._rawData.attributes, ...this.__config.data }
    }
    return this._rawData.attributes
  }

  get body() {
    if (isDev || !this.cached.body) {
      const { _rawData } = this
      const { dirName, section, fileName, filePath } = this.__meta
      if (fileName.search(/\.comp\.md$/) > -1) {
        let relativePath = '.' + join(dirName, section, fileName)
        relativePath = relativePath.replace(/\\/, '/') // normalize windows path
        this.cached.body = {
          relativePath // component body compiled by loader and imported separately
        }
      } else if (fileName.search(/\.md$/) > -1) {
        if (this.__config.markdown.plugins.toc) {
          // Inject callback in markdown-it-anchor plugin
          this.__config.markdown.plugins.toc[1].callback = this.tocParserCallback
        }
        // markdown to html
        this.cached.body = this.__config.parser.render(_rawData.body)
      } else if (fileName.search(/\.(yaml|yml)$/) > -1) {
        const source = readFileSync(filePath).toString()
        const body = yaml.load(source)
        this.cached.body = body
      }
    }
    return this.cached.body
  }

  get date() {
    if (isDev || !this.cached.date) {
      const { filePath, fileName, section } = this.__meta
      if (this.__config.isPost) {
        const fileDate = fileName.match(/!?(\d{4}-\d{2}-\d{2})/) // YYYY-MM-DD
        if (!fileDate) {
          throw new Error(
            `File "${fileName}" on ${section} Needs a date in YYYY-MM-DD-filename.md!`
          )
        }
        this.cached.date = fileDate[0]
      } else {
        const stats = statSync(filePath)
        this.cached.date = dateFns.format(stats.ctime, 'YYYY-MM-DD')
      }
    }
    return this.cached.date
  }

  get _rawData() {
    if (isDev || !this.cached.data) {
      const source = readFileSync(this.__meta.filePath).toString()
      if (this.__meta.fileName.search(/\.md$/) > -1) {
        const { data: attributes, content: body } = matter(source)
        this.cached.data = { attributes, body }
      } else if (this.__meta.fileName.search(/\.(yaml|yml)$/) > -1) {
        const body = yaml.load(source)
        this.cached.data = { attributes: {}, body }
      }
    }
    return this.cached.data
  }

  set toc(entry) {
    if (!this.__config.toc) { return }
    const { permalink } = this
    if (typeof this.cached.toc === 'undefined') {
      this.cached.toc = {}
    }
    if (typeof this.cached.toc[permalink] === 'undefined') {
      this.cached.toc[permalink] = {
        topLevel: Infinity,
        items: {}
      }
    }
    if (typeof this.cached.toc[permalink].items[entry.slug] !== 'undefined') {
      return
    }

    const tocEntry = {
      level: parseInt(entry.tag.substr(1)),
      title: entry.title,
      link: '#' + entry.slug
    }
    if (tocEntry.level < this.cached.toc[permalink].topLevel) {
      this.cached.toc[permalink].topLevel = tocEntry.level
    }
    if (typeof this.cached.toc[permalink].items[entry.slug] === 'undefined') {
      this.cached.toc[permalink].items[entry.slug] = tocEntry
    }
  }

  get toc() {
    if (!this.__config.toc) { return null }
    return this.cached.toc[this.permalink]
  }

  /**
   * @description Callback for the toc
   *
   * @param {Object} token The token object from markdownIt
   * @param {Object.<string, [string, string]>} token.attrs The attributes for the token ej. class
   * @param {*} token.tag The tag for the token
   * @param {Object} info Title and slug
   * @param {string} info.title The title text of the anchor
   * @param {string} info.slug The slug for the anchor
   * @returns {void}
   *
   * @memberOf Page
   */
  tocParserCallback(token, info) {
    let addToToc = true
    if (typeof token.attrs !== 'undefined') {
      Object.keys(token.attrs).forEach(attr => {
        const value = token.attrs[attr][1]
        const key = token.attrs[attr][0]
        if (key === 'class' && value.includes('notoc')) {
          addToToc = false
        }
      })
    }
    if (addToToc) {
      this.toc = {
        tag: token.tag,
        slug: info.slug,
        title: info.title
      }
    }
  }
}
