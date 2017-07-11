const { join } = require('path')

/**
 * Convert permalink to file name.
 *
 */
export function serialize(permalink, options) {
  const removeFirstSlash = /^\//g
  const removeAllButFirstSlash = /(?!^\/)(\/)/g

  const fileName = options.isStatic
    ? permalink.replace(removeAllButFirstSlash, '.')
    : permalink.replace(removeFirstSlash, '')

  return options.isStatic
    ? join(options.srcDir + fileName) + '.json'
    : fileName
}
