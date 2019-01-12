import { join, sep } from 'path'
import { readdirSync } from 'fs'

import Page from './page'

const { max, min } = Math
/** @typedef {import('../config').NuxtentConfigContent} NuxtentConfigContent */
/** @typedef {import('./page').NuxtentPageData} NuxtentPageData */
/**
 * @typedef {Object} NuxtentFileMeta
 * @property {number} index The index of the file
 * @property {string} fileName The filename
 * @property {string} section The section aka folder of the file
 * @property {string} filePath The section aka folder of the file
 * @property {string} dirName The directory for the content
 */
/**
 * @typedef {Map.<string, Page>} NuxtentFileStore
 */
/**
 * @description The database for each content container
 *
 * @export
 * @class Database
 */
export default class Database {
  dirPath = ''
  /**
   * Creates an instance of Database.
   * @param {string} contentDir The directory where the content is located
   * @param {string} dirName The name of the folder for the content
   * @param {NuxtentConfigContent} dirOpts The content container options
   *
   * @memberOf Database
   */
  constructor(contentDir, dirName, dirOpts) {
    /** @type {string} */
    this.dirPath = join(contentDir, dirName)

    /** @type {NuxtentFileStore} */
    const fileStore = new Map()
    /**
     *
     * @param {NuxtentFileMeta} meta The metadata of the file
     * @returns {Page} The page
     */
    const createMap = ({ index, fileName, section }) => {
      const filePath = join(contentDir, dirName, section, fileName)
      const meta = { index, fileName, section, dirName, filePath }
      return new Page(meta, dirOpts)
    }
    /**
     * @param {string} dirPath The directory path
     * @param {string} nestedPath The path to search
     * @returns {NuxtentFileStore} The filled file store
     */
    const globAndApply = (dirPath, nestedPath = sep) => {
      const stats = readdirSync(dirPath, {
        withFileTypes: true
      }).reverse() // posts more useful in reverse order
      stats.forEach((stat, index) => {
        const statPath = join(dirPath, stat.name)
        if (stat.isFile()) {
          // Allow only yaml and markdown files
          if (stat.name.search(/\.(yaml|yml|md|json)$/) !== -1) {
            const fileData = { index, fileName: stat.name, section: nestedPath, filePath: statPath }
            const page = createMap(fileData)
            fileStore.set(page.permalink, page)
          }
        } else {
          globAndApply(statPath, join(nestedPath, stat.name))
        }
      })
      return fileStore
    }

    this.pagesMap = globAndApply(this.dirPath)

    if (dirOpts.breadcrumbs === true) {
      this.__loadBreadcrumbs(dirOpts.page)
    }

    this.pagesArr = [...this.pagesMap.values()]
  }

  /**
   * @description Loads the breadcrumbs
   *
   * @param {string} dirPage The page directory
   * @private
   * @returns {void}
   * @memberOf Database
   */
  __loadBreadcrumbs(dirPage) {
    const target = dirPage
      .split('/')
      .slice(0, -1)
      .join('/')
    for (const page of this.pagesMap.values()) {
      const hops = page.permalink.substr(target.length + 1).split('/')
      const breadcrumbs = []
      for (let i = 0; i < hops.length; i++) {
        let crumb = target
        for (let j = 0; j < i; j++) {
          crumb += '/' + hops[j]
        }
        if (crumb !== target) {
          breadcrumbs.push({
            frontMatter: this.pagesMap.get(crumb).attributes,
            permalink: crumb
          })
        }
      }
      if (breadcrumbs.length > 0) {
        const attributes = {
          ...this.pagesMap.get(page.permalink).attributes,
          ...{ breadcrumbs }
        }
        const pageWithBreadcrumbs = {
          ...this.pagesMap.get(page.permalink),
          attributes
        }
        this.pagesMap.set(page.permalink, pageWithBreadcrumbs)
      }
    }
  }

  /**
   * @param {any} permalink The permalink for the page
   * @public
   * @returns {boolean} Weather or not exist this page
   */
  exists(permalink) {
    return this.pagesMap.has(permalink)
  }

  /**
   * @param {any} permalink The permalink for the page
   * @param {any} query Query parameters that the page might need
   * @returns {NuxtentPageData} The page data
   */
  find(permalink, query) {
    return this.pagesMap.get(permalink).create(query)
  }

  /**
   * @param {string[] | [string, string] | string} onlyArg Arguments for the search
   * @param {any} query The query parameters
   * @returns {NuxtentPageData[]} An array of pages that mathced the args
   */
  findOnly(onlyArg, query) {
    if (typeof onlyArg === 'string') {
      onlyArg = onlyArg.split(',')
    }

    const [startIndex, endIndex] = onlyArg
    let currIndex = max(0, parseInt(startIndex))
    const finalIndex =
   endIndex !== undefined
     ? min(parseInt(endIndex), this.pagesArr.length - 1)
     : null

    if (!finalIndex) {
      return this.pagesArr[currIndex].create(query)
    }

    const pages = []
    if (finalIndex) {
      while (currIndex <= finalIndex) {
        pages.push(this.pagesArr[currIndex])
        currIndex++
      }
    }

    return pages.map(page => page.create(query))
  }

  /**
   * @param {string} betweenStr String of the start and end index
   * @param {any} query query parameters
   * @returns {NuxtentPageData[]} An array with the search results
   */
  findBetween(betweenStr, query) {
    const { findOnly } = this
    const [currPermalink, numStr1, numStr2] = betweenStr.split(',')

    if (!this.pagesMap.has(currPermalink)) {
      return []
    }

    const currPage = this.pagesMap.get(currPermalink).create(query)
    const { index } = currPage.meta
    const total = this.pagesArr.length - 1

    const num1 = parseInt(numStr1 || 0)
    const num2 = numStr2 !== undefined ? parseInt(numStr2) : null

    if (num1 === 0 && num2 === 0) {
      return [currPage]
    }

    /** @type {number[] | never[]} */
    let beforeRange
    if (num1 === 0) {
      beforeRange = []
    } else {
      beforeRange = [max(0, index - num1), max(min(index - 1, total), 0)]
    }

    /** @type {number[] | never[]} */
    let afterRange
    if (num2 === 0 || (!num2 && num1 === 0)) {
      afterRange = []
    } else {
      afterRange = [min(index + 1, total), min(index + (num2 || num1), total)]
    }

    const beforePages = findOnly(beforeRange, query)
    const afterPages = findOnly(afterRange, query)

    return [currPage, beforePages, afterPages]
  }

  /**
   * @param {*} query The query parameters
   * @returns {NuxtentPageData[]} The page array with all the content
   */
  findAll(query) {
    return this.pagesArr.map(
      page => page.create(query))
  }
}
