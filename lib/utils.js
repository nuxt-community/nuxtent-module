/* eslint-disable no-useless-escape */
import diacritics from 'diacritics'
import consola from 'consola'
import { sep } from 'path'

/**
 * Slugifies a string
 * Borrowed from vuepress, those guys are amazing
 * string.js slugify drops non ascii chars so we have to
 * use a custom implementation here
 * @param {string} str The string to slugify
 * @returns {string} The slugified string
 */
export const slugify = (str) => {
  // eslint-disable-next-line no-control-regex
  const rControl = /[\u0000-\u001f]/g
  const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'<>,.?/]+/g
  return (
    diacritics.remove(str)
      .normalize('NFD')
      // Remove control characters
      .replace(rControl, '')
      // Replace special characters
      .replace(rSpecial, '-')
      // Remove continous separators
      .replace(/\-{2,}/g, '-')
      // Remove prefixing and trailing separtors
      .replace(/^\-+|\-+$/g, '')
      // ensure it doesn't start with a number (#121)
      .replace(/^(\d)/, '_$1')
      // lowercase
      .toLowerCase()
  )
}

export const logger = consola.withScope('nuxt:nuxtent')

/**
 * Converts a path route to a url like name
 * @param {string} routePath The route path in vue file format
 * // /pages/_category/_slug => pages-category-slug
 * @returns {string} The url like name
 */
export const pathToName = routePath => {
  const firstSlash = /^\//
  return routePath
    .replace(firstSlash, '')
    .replace(sep, '-')
    .replace('_', '')
}

/**
 * @description Genera objeto de componentes dinamicos
 *
 * @param {Map} assetMap El mapa de páginas
 * @returns {String[]} array
 */
export function generatePluginMap (assetMap) {
  const webpackAlias = '~/content'
  const mdComps = []
  for (const collections of assetMap.values()) {
    for (const page of collections.__pagesMap.values()) {
      if (page.meta.fileName.endsWith('.comp.md')) {
        let filePath = webpackAlias + page.body.relativePath.substring(1)
        mdComps.push([page.body.relativePath, filePath])
      }
    }
  }
  return mdComps
}