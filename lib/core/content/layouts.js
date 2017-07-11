const fs = require('fs')
const join = require('path').join

var layoutNames

/**
 * Gets the template and styles of the requested content directory.
 * (The script element is not included because only one is allowed
 *  and we create our own based on the file's front-matter.)
 */
module.exports = function getLayouts(config) {
  if (!layoutNames) layoutNames = getLayoutNames(config)

  return function loadLayout (filePath) {
    const contentDir = getDir(filePath, config.srcPath)
    const layoutsPath = join(config.srcPath, config.layoutDir)
    const layoutName = getLayout(contentDir, layoutNames)

    const path = join(layoutsPath, layoutName)
    if (layoutName !== 'default') {
      let ext
      if (fs.existsSync(`${path}.vue`)) ext = '.vue'
      else if (fs.existsSync(`${path}.js`)) ext = '.js'
      else throw Error(`Layout ${layoutName} does not exists`)

      return path + ext
    }
  }
}


/**
 * Gets the layout name of all registered directories.
 */
function getLayoutNames (config) {
  const layouts = {}
  config.dirs.forEach(data => {
    const dirName = join(data[0] + '/')
    const dirOpts = data[1]
    layouts[dirName] = dirOpts.layout || config.layout
  })
  return layouts
}

/**
 * Retrieves layout of closest registered directory. (Some content
 * may be nested, but not registered.)
 */
function getLayout (dirName, layouts) {
  if (layouts[dirName]) return layouts[dirName]
  else { // get closest dir by finding longest string match
    var closestDir = ''
    Object.keys(layouts).forEach(key => {
      if (dirName.match(key) && closestDir.length < key.length) closestDir = key
    })
    return layouts[closestDir]
  }
}

function getDir (filePath, srcPath) {
  return filePath
    .replace(srcPath, '')   // remove source path
    .replace(/[^\/]*$/, '') // remove file name
}
