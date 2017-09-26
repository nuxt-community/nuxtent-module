import { join } from 'path'
import { readdirSync, statSync } from 'fs'

import prepPage from './page'

const { max, min } = Math

const globAndApply = (dirPath, fileStore, applyFn, nestedPath = '/') => {
  const stats = readdirSync(dirPath).reverse() // posts more useful in reverse order
  stats.forEach((stat, index) => {
    const statPath = join(dirPath, stat)
    if (statSync(statPath).isFile()) {
      const fileData = { index, fileName: stat, section: nestedPath }
      applyFn(fileData, fileStore)
    } else {
      globAndApply(statPath, fileStore, applyFn, join(nestedPath, stat))
    }
  })
  return fileStore
}

export default function createDatabase(contentDir, dirName, dirOpts, isDev) {
  const dirPath = join(contentDir, dirName)

  const pagesMap = globAndApply(
    dirPath,
    new Map(),
    ({ index, fileName, section }, store) => {
      const filePath = join(contentDir, dirName, section, fileName)
      const meta = { index, fileName, section, dirName, filePath }
      const lazyPage = prepPage(meta, dirOpts, isDev)
      store.set(lazyPage.permalink, lazyPage)
    }
  )

  const pagesArr = [...pagesMap.values()]

  return {
    exists(permalink) {
      return pagesMap.has(permalink)
    },

    find(permalink, query) {
      return pagesMap.get(permalink).create(query)
    },

    findOnly(onlyArg, query) {
      if (typeof onlyArg === 'string') {
        onlyArg = onlyArg.split(',')
      }

      const [startIndex, endIndex] = onlyArg
      let currIndex = max(0, parseInt(startIndex))
      const finalIndex =
        endIndex !== undefined
          ? min(parseInt(endIndex), pagesArr.length - 1)
          : null

      if (!finalIndex) {
        return pagesArr[currIndex].create(query)
      }

      const pages = []
      if (finalIndex) {
        while (currIndex <= finalIndex) {
          pages.push(pagesArr[currIndex])
          currIndex++
        }
      }

      return pages.map(page => page.create(query))
    },

    findBetween(betweenStr, query) {
      const { findOnly } = this
      const [currPermalink, numStr1, numStr2] = betweenStr.split(',')

      if (!pagesMap.has(currPermalink)) {
        return []
      }

      const currPage = pagesMap.get(currPermalink).create(query)
      const { index } = currPage.meta
      const total = pagesArr.length - 1

      const num1 = parseInt(numStr1 || 0)
      const num2 = numStr2 !== undefined ? parseInt(numStr2) : null

      if (num1 === 0 && num2 === 0) {
        return [currPage]
      }

      let beforeRange
      if (num1 === 0) {
        beforeRange = []
      } else {
        beforeRange = [max(0, index - num1), max(min(index - 1, total), 0)]
      }

      let afterRange
      if (num2 === 0 || (!num2 && num1 === 0)) {
        afterRange = []
      } else {
        afterRange = [min(index + 1, total), min(index + (num2 || num1), total)]
      }

      const beforePages = findOnly(beforeRange, query)
      const afterPages = findOnly(afterRange, query)

      return [currPage, beforePages, afterPages]
    },

    findAll(query) {
      return pagesArr.map(page => page.create(query))
    }
  }
}
