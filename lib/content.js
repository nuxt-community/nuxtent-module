const fs = require('fs')
const { join } = require('path')
const fm = require('front-matter')
const pathToRegexp = require('path-to-regexp')
const paramCase = require('param-case')

var contentData = {}

/**
 * Returns 2D array of content data, each with its respective
 * registered directory, options, and nested file data.
 *
 * The data includes both the data that will be used to create the route
 * and the data that will be injected into the component's layout.
 *
 * You also have the option of only requesting the data of a specific
 * registered direction.
 */
exports.default = function getContent (options) {
  const srcPath = join(options.srcPath, options.srcDir)

  const registeredDirs = !Array.isArray(options.dirs[0])
    ? [[options.dirs[0]]] : options.dirs

  registeredDirs.forEach(type => {
    const dirName = join('/', type[0])
    const dirOpts = getDirOpts(type[1] || {}, options)
    const otherDirs = getOtherRegisteredDirs(dirName, registeredDirs)
    contentData[dirName] = []
    getFromDir(srcPath, dirName, otherDirs, dirOpts)
  })
  return contentData
}

exports.getContent = function (onlyDir) {
  return contentData
}


/**
 * Initiates fecthing of pages from specified directory.
 */
function getFromDir(srcPath, registeredDir, blacklist, dirOpts) {
  /**
   * Recursively gets all content files nested under registered directory.
   */
  function applyToAllDirFiles (dir, func, files = []) {
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

  const dirPath = join(srcPath, registeredDir)
  fs.readdirSync(dirPath).forEach(stat => {
    const statPath = join(dirPath, stat)
    if(fs.statSync(statPath).isDirectory()) { // Nested Files
      const dirSection = join(registeredDir, stat)
      if (!(blacklist.indexOf(dirSection) > -1)) {
        applyToAllDirFiles(stat, nestedFilePath => {
          const filePath = join(dirPath, nestedFilePath)
          contentData[registeredDir].push({
            src: nestedFilePath,
            data: getFileData(filePath, registeredDir, dirOpts)
          })
        })
      }
    } else { // Top Level files
      contentData[registeredDir].push({
        src: stat,
        data: getFileData(statPath, registeredDir, dirOpts)
      })
    }
  })
  return contentData
}


/**
 * Gets data required to create component's route and page layout.
 *
 * Data is retrieved either via 1) front-matter 2) file name 3) config options.
 */
function getFileData(filePath, section, dirOpts) {
  const source = fs.readFileSync(filePath, 'utf-8')
  const metadata = fm(source).attributes

  const fileName = filePath
    .replace(/^.*[\\\/]/, '')  //remove path
    .replace(/(.)[^.]+$/, '')  // remove ext
  const fileDate = fileName.match(/!?(\d{4}-\d{2}-\d{2})/)

  let permalink
  let date
  if (metadata.permalink) {
    permalink = metadata.permalink
  } else {
    slug = fileName.replace(/!?(\d{4}-\d{2}-\d{2}-)/, '') // remove date
    const urlOpts = {
      section,
      slug: paramCase(metadata.slug || slug)
    }

    if (dirOpts.isPost) {
      if (!fileDate) throw Error(`Content in "${section}" does not have a date!`)
      date = fileDate[0]
      const dateData = date.split('-')
      urlOpts.year = dateData[0]
      urlOpts.month = dateData[1]
      urlOpts.day = dateData[2]
    }

    const toPath = pathToRegexp.compile(dirOpts.permalink)
    permalink = toPath(urlOpts, { pretty: true })
      .replace(/%2F/gi, "/") // make url encoded slash pretty
  }

  const pageData = Object.assign({}, dirOpts.data, metadata, {
    date,
    permalink,
    section
  })

  return {
    fileName,
    section,
    options: dirOpts,
    page: pageData,
    route: {
      path: join("/", permalink),
      component: filePath
    }
  }
}


/**
 * Gets content options via 1) directory options 2) global content config.
 */
function getDirOpts (dir, config) {
  const mergedData = Object.assign({}, config.data, dir.data)
  const opts = Object.assign({}, config, dir, { data: mergedData })

  return {
    route: join('/', opts.route),
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
