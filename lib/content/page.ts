import { join } from 'path'
import { readFileSync, statSync } from 'fs'

import matter from 'gray-matter'
import dateFns from 'date-fns'
import _ from 'lodash'
import pathToRegexp from 'path-to-regexp'
import yaml from 'js-yaml'
import { slugify, logger } from '../utils'
// import { logger } from '../utils'
import { Nuxtent } from '../../types'
import Anchor from 'markdown-it-anchor'
import Token from 'markdown-it/lib/token'
const permalinkCompiler = pathToRegexp.compile

/**
 * Creates a slug
 * @param {string} fileName The file name
 * @returns {string} the slugified string
 */
const getSlug = (fileName: string): string => {
  let onlyName = fileName
    .replace(/(\.comp)?(\.[0-9a-z]+)$/, '') // remove any ext
    .replace(/!?(\d{4}-\d{2}-\d{2}-)/, '') // remove date and hypen
  onlyName = slugify(onlyName)

  return _.kebabCase(onlyName)
}

/**
 * Converts the date of the post into object
 * @param {string} date The date
 * @returns {{year: string, month: string, day: string}} The date object
 */
const splitDate = (
  date: string
): { year: string; month: string; day: string } => {
  const [year, month, day] = date.split('-')
  return {
    day,
    month,
    year,
  }
}
declare interface IPrivateFileMeta extends Nuxtent.Database.FileMeta {
  filePath: string
}
const isDev = process.env.NODE_ENV !== 'production'
export default class Page {
  /**
   * Gets the meta but hides the file path
   */
  get meta(): Nuxtent.Database.FileMeta {
    const cleanedMeta = Object.assign({}, this.__meta)
    // Never expose the filePath
    delete cleanedMeta.filePath
    return cleanedMeta
  }

  /**
   * Gets the path of the file
   */
  get path() {
    // If there is no page defined in the configuration return the permalink
    if (!this.config.page) {
      return this.permalink
    }
    // If is dev or isn't cached make it
    if (isDev || !this.cached.path) {
      const nestedPath = /([^_][a-zA-z]*?)\/[^a-z_]*/
      const matchedPath = this.config.page.match(nestedPath)
      if (matchedPath && matchedPath[1] !== 'index') {
        this.cached.path = join(matchedPath[1], this.permalink).replace(
          /\\|\/\//,
          '/'
        )
      } else {
        this.cached.path = this.permalink.replace(/\\|\/\//, '/')
      }
    }
    return this.cached.path
  }

  /**
   * Gets the valid permalink for this page
   */
  get permalink() {
    if (isDev || !this.cached.permalink) {
      const date = this.date.toString()
      const { section, fileName } = this.meta
      const slug = getSlug(fileName)
      const { year, month, day } = splitDate(date)
      const params = { section, slug, date, year, month, day }
      const toPermalink = permalinkCompiler(this.config.permalink)
      let permalink = join(
        '/',
        toPermalink(params).replace(/%2F/gi, '/') // make url encoded slash pretty
      )
      // Handle permalinks for subdirectory indexes
      if (permalink.length > 6 && permalink.substr(-6) === '/index') {
        permalink = permalink.substr(0, permalink.length - 6)
      }
      this.cached.permalink = permalink.replace(/\\|\\\\/g, '/')
    }
    return this.cached.permalink
  }

  /**
   * Gets all the attributes
   */
  get attributes() {
    if (typeof this.config.data === 'object') {
      return { ...this._rawData.attributes, ...this.config.data }
    }
    return this._rawData.attributes
  }

  /**
   * Gets the body contents for the object
   */
  get body(): Nuxtent.Page.Body {
    if (isDev || this.cached.body === null) {
      const { dirName, section, fileName, filePath } = this.__meta
      if (fileName.search(/\.comp\.md$/) > -1) {
        let relativePath = '.' + join(dirName, section, fileName)
        relativePath = relativePath.replace(/\\/, '/') // normalize windows path
        if (!relativePath) {
          logger.error('Path not found for ' + this._rawData.fileName)
        }
        this.cached.body = {
          content: this._rawData.body.content,
          relativePath, // component body compiled by loader and imported separately
        }
      } else if (fileName.search(/\.md$/) > -1) {
        if (this.config.markdown.plugins.toc) {
          // Inject callback in markdown-it-anchor plugin
          const tocPlugin = this.config.markdown.plugins
            .toc as Nuxtent.Config.MarkdownItPluginArray
          tocPlugin[1].callback = this.tocParserCallback
        }
        // markdown to html
        if (this.config.markdown.parser) {
          if (!this._rawData.body.content) {
            logger.warn(`Empty content on ${this.path}`)
          }
          this.cached.body = this.config.markdown.parser.render(
            this._rawData.body.content || ''
          )
        } else {
          logger.error(`The ${this.config.permalink} markdown config is wrong`)
        }
      } else if (fileName.endsWith('.html')) {
        this.cached.body = this._rawData.body.content || ''
      } else if (fileName.search(/\.(yaml|yml)$/) > -1) {
        const source = readFileSync(filePath).toString()
        const body = yaml.load(source)
        this.cached.body = body
      }
    }
    if (this.cached.body === null) {
      throw new Error('Unexpected result on get body')
    }
    return this.cached.body
  }

  get date() {
    if (isDev || !this.cached.date) {
      const { filePath, fileName, section } = this.__meta
      if (this.config.isPost) {
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

  get _rawData(): Nuxtent.Page.RawData {
    if (isDev || !this.cached.data.fileName) {
      const source = readFileSync(this.__meta.filePath).toString()
      const fileName = this.__meta.fileName
      this.cached.data.fileName = fileName
      if (fileName.search(/\.(md|html)$/) !== -1) {
        // { data: attributes, content: body } = matter(source)
        const result = matter(source, {
          excerpt: true,
        })
        this.cached.data.attributes = Object.assign(
          { excerpt: result.excerpt },
          result.data
        )
        this.cached.data.body.content = result.content
      } else if (fileName.search(/\.(yaml|yml)$/) !== -1) {
        this.cached.data.body.content = yaml.load(source)
      } else if (fileName.endsWith('.json')) {
        this.cached.data.body.content = JSON.parse(source)
      } else {
        logger.warn(`The file ${fileName} is not compatible with nuxtent`)
      }
    }
    return this.cached.data
  }

  set toc(entry: Nuxtent.Page.PageToc | null) {
    if (!this.config.toc || !entry) {
      return
    }
    if (typeof this.cached.toc === 'undefined') {
      this.cached.toc = {}
    }
    if (typeof this.cached.toc[this.permalink] === 'undefined') {
      this.cached.toc[this.permalink] = {
        items: {},
        slug: entry.slug,
        topLevel: Infinity,
      }
    }
    if (
      !entry.slug ||
      typeof this.cached.toc[this.permalink].items[entry.slug] !== 'undefined'
    ) {
      return
    }

    const tocEntry = {
      level: entry.tag ? parseInt(entry.tag.substr(1), 10) : 1,
      link: '#' + entry.slug,
      title: entry.title,
    }
    if (tocEntry.level < this.cached.toc[this.permalink].topLevel) {
      this.cached.toc[this.permalink].topLevel = tocEntry.level
    }
    if (
      typeof this.cached.toc[this.permalink].items[entry.slug] === 'undefined'
    ) {
      this.cached.toc[this.permalink].items[entry.slug] = tocEntry
    }
  }

  get toc(): Nuxtent.Page.PageToc | null {
    if (!this.config.toc || !this.cached.toc) {
      return null
    }
    return this.cached.toc[this.permalink]
  }

  private cached: Nuxtent.Page.PageData = {
    attributes: {},
    body: null,
    data: {
      attributes: {},
      body: {},
    },
    date: null,
    path: null,
    permalink: null,
  }

  private __meta: IPrivateFileMeta

  private config: Nuxtent.Config.Content

  private propsSet: Set<Nuxtent.Page.PageProp | string> = new Set([
    'meta',
    'date',
    'path',
    'permalink',
    'breadcrumbs',
    'attributes',
    'body',
  ])

  get breadcrumbs() {
    if (Array.isArray(this.cached.breadcrumbs)) {
      return this.cached.breadcrumbs
    }
    return []
  }

  set breadcrumbs(crumbs: Nuxtent.Page.Breadcrumbs[]) {
    this.cached.breadcrumbs = crumbs
  }

  /**
   * Creates an instance of Page.
   * @param meta The metadata for the page file
   * @param contentConfig The content configuration
   *
   * @memberOf Page
   */
  constructor(meta: IPrivateFileMeta, contentConfig: Nuxtent.Config.Content) {
    this.__meta = meta
    this.config = contentConfig
    if (contentConfig.toc !== false) {
      this.propsSet.add('toc')
    }
  }
  /**
   * @description Creates an instance of the page
   *
   * @param [params={}] Params
   * @param [params.exclude] The props exclution list
   * @returns {Object} The page content
   *
   * @memberOf Page
   */
  public create(params: Nuxtent.Query): Nuxtent.Page.PublicPage {
    const excludes = params.exclude || []
    excludes.forEach(prop => {
      if (this.propsSet.has(prop)) {
        this.propsSet.delete(prop)
      }
    })
    const data: Nuxtent.Page.PublicPage = {
      attributes: {},
      body: '',
      date: null,
      path: null,
      permalink: '',
    }
    this.propsSet.forEach(prop => {
      if (prop === 'attributes') {
        Object.assign(data, this[prop])
        // @ts-ignore
      } else if (this[prop] !== undefined) {
        // @ts-ignore
        data[prop] = this[prop]
      }
    })

    return data
  }

  /**
   * @description Callback for the toc
   *
   * @param token The token object from markdownIt
   * @param token.attrs The attributes for the token ej. class
   * @param token.tag The tag for the token
   * @param info Title and slug
   * @param info.title The title text of the anchor
   * @param info.slug The slug for the anchor
   * @returns {void}
   *
   * @memberOf Page
   */
  private tocParserCallback(token: Token, info: Anchor.AnchorInfo) {
    let addToToc = true
    if (typeof token.attrs !== 'undefined') {
      const classValue = token.attrGet('class')
      if (classValue && classValue.includes('notoc')) {
        addToToc = true
      }
    }
    if (addToToc) {
      this.toc = {
        items: {},
        slug: info.slug,
        tag: token.tag,
        title: info.title,
        topLevel: 0,
      }
    }
  }
}
