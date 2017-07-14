const { resolve } = require('path')

export const serialize = {
  /**
   * Serialize permalink to file path.
   *
   * If in server, we're reading local files, so we use the unique permalink
   * to get the closest file name match.
   *
   * Otherwise, we're using the permalink to convert or to retrieve files generated
   * for browser. So as a convention, we convert slashes "/" to hypens  "-" so that
   * the generated content is not overly nested.
   *
   */
  filePath (permalink, section, { isDev, srcDir }) {
    const allButFirstSlash = /(?!^\/)(\/)/g

    return isDev
      ? resolve(srcDir, section, permalink) + '.md'
      : permalink.replace(allButFirstSlash, '.')
  }
}
