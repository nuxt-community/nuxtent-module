const { join } = require('path')
const fs = require('fs')
const fm = require('front-matter')
const pathToRegexp = require('path-to-regexp')
const paramCase = require('param-case')
const parser = require('markdown-it')({
  preset: 'default',
  html: true
  // highlight: renderHighlight
})

var contentMap = new Map()

/**
 * Returns a content map. The key is the registered directory name and the
 * value is a nested map of a specific file's data,
 * which is indentified by its permalink.
 */
export default function getContent (options) {
  const srcPath = join(options.srcPath, options.srcDir)

  const registeredDirs = !Array.isArray(options.dirs[0])
    ? [[options.dirs[0]]] : options.dirs

  registeredDirs.forEach(type => {
    const dirName = join('/', type[0])
    const dirOpts = getDirOpts(type[1] || {}, options)
    const otherDirs = getOtherRegisteredDirs(dirName, registeredDirs)
    contentMap.set(dirName, new Map())
    getFromDir(srcPath, dirName, otherDirs, dirOpts)
  })
  return contentMap
}

/**
 * Initiates fecthing of pages from specified directory.
 */
function getFromDir(srcPath, registeredDir, blacklist, dirOpts) {
  /**
   * Recursively gets all content files nested under registered directory.
   */
  function applyToAllFiles (dir, func, files = []) {
    const dirPath = join(srcPath, registeredDir, dir)
    fs.readdirSync(dirPath).forEach(stat => {
      const statPath = join(dirPath, stat)
      if(fs.statSync(statPath).isDirectory()) {
        const nestedDir = join(dir, stat)
        getFilesData(nestedDir, func, files)
      } else {
        const nestedfilePath = join(dir, stat)
        func(nestedfilePath)
      }
    })
    return files
  }

  const contentDirMap = contentMap.get(registeredDir)
  const dirPath = join(srcPath, registeredDir)

  fs.readdirSync(dirPath).forEach(stat => {
    const statPath = join(dirPath, stat)
    if(fs.statSync(statPath).isDirectory()) { // Nested Files
      const dirSection = join(registeredDir, stat)
      if (!(blacklist.indexOf(dirSection) > -1)) {
        applyToAllFiles(stat, nestedFilePath => {
          const filePath = join(dirPath, nestedFilePath)
          const data = getPageData(filePath, registeredDir, dirOpts)
          contentDirMap.set(data.permalink, data)
        })
      }
    } else { // Top Level files
      const data = getPageData(statPath, registeredDir, dirOpts)
      contentDirMap.set(data.permalink, data)
    }
  })

  return contentMap
}


/**
 * Gets all required page data.
 *
 * Data is retrieved either via 1) front-matter 2) file name 3) config options.
 */
function getPageData(filePath, section, dirOpts) {
  function getUrlData (metadata) {
    const urlData = {}

    urlData.fileName = filePath
      .replace(/^.*[\\\/]/, '')  // remove path
      .replace(/(.)[^.]+$/, '')  // remove ext

    urlData.section = section

    urlData.slug = paramCase(metadata.slug
      || urlData.fileName.replace(/!?(\d{4}-\d{2}-\d{2}-)/, '')) // remove date

    if (dirOpts.isPost) {
      const fileDate = urlData.fileName.match(/!?(\d{4}-\d{2}-\d{2})/) // YYYY-MM-DD
      if (!fileDate) throw Error(`Content in "${section}" does not have a date!`)

      urlData.date = fileDate[0]

      const dateData = urlData.date.split('-')
      urlData.year = dateData[0]
      urlData.month = dateData[1]
      urlData.day = dateData[2]
    }

    const toPath = pathToRegexp.compile(dirOpts.permalink)
    urlData.permalink = metadata.permalink
      || toPath(urlData, { pretty: true }).replace(/%2F/gi, "/") // make url encoded slash pretty

    return urlData
  }

  const source = fs.readFileSync(filePath, 'utf-8')
  const frontMatter = fm(source)

  const metadata = frontMatter.attributes
  const urlData = getUrlData(metadata, dirOpts)
  const markdown = frontMatter.body

  const data = Object.assign({}, urlData, metadata, {
    content: parser.render(markdown) // md -> html
  })

  return data
}

/**
 * Gets content options via 1) directory options 2) global content config.
 */
function getDirOpts (dir, config) {
  const mergedData = Object.assign({}, config.data, dir.data)
  const opts = Object.assign({}, config, dir, { data: mergedData })

  return {
    permalink: opts.permalink,
    isPost: !(opts.isPost === false),
    data: opts.data
  }
}

/**
 * Gets all the registered content directory types.
 */
function  getOtherRegisteredDirs (currDir, contentTypes) {
  const dirs = []
  contentTypes.forEach(type => {
    const dir = type[0]
    if (dir !== currDir) dirs.push(join('/' + dir))
  })
  return dirs
}
