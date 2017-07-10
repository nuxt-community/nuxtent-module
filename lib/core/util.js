const { join } = require('path')

/**
 * Convert permalink to file name.
 *
 */
export function serialize(permalink, options) {
  const fileName = join(options.srcDir + '/', permalink.replace('/', '.'))
  return `${fileName}.json`
}
