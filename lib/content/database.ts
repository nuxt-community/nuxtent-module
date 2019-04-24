import { join, sep } from 'path'
import { readdirSync } from 'fs'

import Page from './page'
import { Nuxtent } from '../../types/index'
import { logger } from '../utils'

const { max, min } = Math

/**
 * @description The database for each content container
 *
 * @export
 * @class Database
 */
export default class Database {
  public dirPath = ''
  public pagesMap: Map<string, Page>
  public pagesArr: Page[]
  public permalink: string
  /**
   * Creates an instance of Database.
   * @param {Nuxtent.Config.Build} build The build config
   * @param {string} build.contentDir The directory where the content is located
   * @param {string} build.ignorePrefix The string prefix for ignored files
   * @param {string} dirName The name of the folder for the content
   * @param {Nuxtent.Config.Content} dirOpts The content container options
   *
   * @memberOf Database
   */
  constructor(
    build: Nuxtent.Config.Build,
    dirName: string,
    dirOpts: Nuxtent.Config.Content
  ) {
    this.dirPath = join(build.contentDir, dirName)
    this.permalink = dirOpts.permalink
    const fileStore: Nuxtent.FileStore = new Map()

    const createMap = ({
      index,
      fileName,
      section,
    }: Nuxtent.Database.FileMeta) => {
      const filePath = join(build.contentDir, dirName, section, fileName)
      const meta = { index, fileName, section, dirName, filePath }
      return new Page(meta, dirOpts)
    }

    /**
     * Checks if the file has an allowed extension and if we should ignore it
     * @param name The name of the file.
     */
    function canProcesFile(name: string): boolean {
      const fileTest = new RegExp(`\.(${build.contentExtensions.join('|')}$)`)
      return (
        name.search(fileTest) !== -1 && !name.startsWith(build.ignorePrefix)
      )
    }

    const globAndApply = (
      dirPath: string,
      nestedPath: string = sep
    ): Nuxtent.FileStore => {
      const stats = readdirSync(dirPath, {
        withFileTypes: true,
      }).reverse() // posts more useful in reverse order
      stats.forEach((stat, index) => {
        const statPath = join(dirPath, stat.name)
        if (stat.isFile() && canProcesFile(stat.name)) {
          const fileData: Nuxtent.Database.FileMeta = {
            dirName: dirPath,
            fileName: stat.name,
            filePath: statPath,
            index,
            section: nestedPath,
          }
          const page = createMap(fileData)
          fileStore.set(page.permalink, page)
        } else {
          globAndApply(statPath, join(nestedPath, stat.name))
        }
      })
      return fileStore
    }

    this.pagesMap = globAndApply(this.dirPath)

    if (dirOpts.breadcrumbs === true) {
      this.loadBreadcrumbs(dirOpts.page)
    }

    this.pagesArr = [...this.pagesMap.values()]
  }

  /**
   * @param {string} permalink The permalink for the page
   * @public
   * @returns {boolean} Weather or not exist this page
   */
  public exists(permalink: string): boolean {
    return this.pagesMap.has(permalink)
  }

  /**
   * @param permalink The permalink for the page
   * @param query parameters that the page might need
   * @returns The page data
   */
  public find(
    permalink: string,
    query: Nuxtent.Query
  ): Nuxtent.Page.PublicPage | null {
    const page = this.pagesMap.get(permalink)
    if (page) {
      return page.create(query)
    }
    return null
  }

  /**
   * @param onlyArg Arguments for the search
   * @param query The query parameters
   * @returns An array of pages that mathced the args
   */
  public findOnly(
    onlyArg: Nuxtent.OnlyArg,
    query: Nuxtent.Query
  ): Nuxtent.Page.PublicPage[] {
    if (typeof onlyArg === 'string') {
      onlyArg = onlyArg.split(',')
    }

    const [startIndex, endIndex] = onlyArg
    let currIndex =
      typeof startIndex === 'number'
        ? startIndex
        : max(0, parseInt(startIndex, 10))
    if (Number.isNaN(currIndex)) {
      currIndex = 0
    }
    const finalIndex =
      endIndex !== undefined
        ? min(
            typeof endIndex === 'number' ? endIndex : parseInt(endIndex, 10),
            this.pagesArr.length - 1
          )
        : null

    if (!finalIndex) {
      return [this.pagesArr[currIndex].create(query)]
    }

    const pages: Page[] = []
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
  public findBetween(
    betweenStr: string,
    query: Nuxtent.Query
  ): Nuxtent.Page.PublicPage[] {
    const [currPermalink, numStr1, numStr2] = betweenStr.split(',')

    if (!this.pagesMap.has(currPermalink)) {
      return []
    }
    const page = this.pagesMap.get(currPermalink)
    if (!page) {
      return []
    }
    const currPage = page.create(query)
    if (!currPage.meta) {
      logger.warn('You should not exclude meta when querying between')
      return []
    }
    const { index } = currPage.meta
    const total = this.pagesArr.length - 1

    const num1 = parseInt(numStr1 || '0', 10)
    const num2 = numStr2 !== undefined ? parseInt(numStr2, 10) : null

    if (num1 === 0 && num2 === 0) {
      return [currPage]
    }

    let beforeRange: [number, number] | never[]
    if (num1 === 0) {
      beforeRange = []
    } else {
      beforeRange = [max(0, index - num1), max(min(index - 1, total), 0)]
    }

    let afterRange: [number, number] | never[]
    if (num2 === 0 || (!num2 && num1 === 0)) {
      afterRange = []
    } else {
      afterRange = [min(index + 1, total), min(index + (num2 || num1), total)]
    }

    const beforePages = this.findOnly(beforeRange, query)
    const afterPages = this.findOnly(afterRange, query)

    return [currPage, ...beforePages, ...afterPages]
  }

  /**
   * @param query The query parameters
   * @returns The page array with all the content
   */
  public findAll(query: Nuxtent.Query): Nuxtent.Page.PublicPage[] {
    return this.pagesArr.map(page => page.create(query))
  }

  /**
   * @description Loads the breadcrumbs
   *
   * @param {string} dirPage The page directory
   * @private
   * @returns {void}
   * @memberOf Database
   */
  protected loadBreadcrumbs(dirPage: string) {
    const target = dirPage
      .split('/')
      .slice(0, -1)
      .join('/')
    for (const page of this.pagesMap.values()) {
      const hops = page.permalink.substr(target.length + 1).split('/')
      const breadcrumbs: Nuxtent.Page.Breadcrumbs[] = []
      for (let i = 0; i < hops.length; i++) {
        let crumb = target
        for (let j = 0; j < i; j++) {
          crumb += '/' + hops[j]
        }
        if (crumb !== target) {
          const crumbPage = this.pagesMap.get(crumb)
          if (crumbPage) {
            breadcrumbs.push({
              frontMatter: crumbPage.attributes,
              permalink: crumb,
            })
          }
        }
      }
      if (breadcrumbs.length > 0) {
        page.breadcrumbs = breadcrumbs
        this.pagesMap.set(page.permalink, page)
      }
    }
  }
}
