const { resolve } = require('path')

module.exports = function getModuleOptions(nuxtOpts) {
  const contentVars =  {
    srcPath: nuxtOpts ? nuxtOpts.rootDir : './', // loaded externally or locally
    srcDir: 'content',
    routeName: '',    // no route
    dirs: ['/'],  // all files
    permalink: ':slug',
    isPost: true,
    data: {}
  }
  
  const rootConfig = resolve(nuxtOpts.rootDir, 'nuxt.content.js')
  const userOpts = existsSync(rootConfig) ? require(rootConfig) : nuxtOpts.content
  return Object.assign({}, contentVars, userOpts)
}
