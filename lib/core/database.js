import prepPage from '../content/page'

const { readdirSync, statSync } = require('fs')
const { join } = require('path')

export function createDatabase (dirPath, options) {
  const lazyPages = globAndApply(dirPath, new Map(),
    ({ fileName, section }, store ) => {
      const meta = { fileName, section, dirPath }
      const lazyPage = prepPage(meta, options)
      store.set(lazyPage.permalink, lazyPage)
  })

  return {
    exists (permalink) {
      return lazyPages.has(permalink)
    },

    find (permalink) {
      return lazyPages.get(permalink)
    },

    findAll () {
      return [ ...lazyPages.values() ].map(lazyPage => lazyPage.create())
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
