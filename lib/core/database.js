import prepPage from '../content/page'

const { readdirSync, statSync } = require('fs')
const { join } = require('path')

export function createDatabase (dirPath, options) {
  const pages = globAndApply(dirPath, new Map(),
    ({ fileName, section }, store ) => {
      const meta = { fileName, section, dirPath }
      const lazyPage = prepPage(meta, options)
      store.set(lazyPage.permalink, lazyPage)
  })

  return {
    exists (permalink) {
      return pages.has(permalink)
    },

    find (permalink) {
      console.log(permalink)
      console.log(pages.keys())
      return pages.get(permalink)
    },

    findAll () {
      return [ ...pages.values() ].map(page => page.create())
    }
  }
}

function globAndApply (dirPath, fileStore,  applyFn, nestedPath = '/') {
  readdirSync(dirPath).forEach(stat => {
    const statPath = join(dirPath, stat)
    if(statSync(statPath).isFile()) {
      const fileData = { fileName: stat, section: nestedPath }
      applyFn(fileData, fileStore)
    } else globAndApply(statPath, fileStore, applyFn, join(nestedPath, stat))
  })
  return fileStore
}
