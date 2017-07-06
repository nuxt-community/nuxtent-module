const fs = require('fs')
const loaderUtils = require('loader-utils')
const markdownit = require('markdown-it')
const fm = require('front-matter')
const cheerio = require('cheerio')

// const getLayouts = require('./content/getLayouts')
// const getPages = require('./content/getPages')

// var pagesData
// var getLayout

/**
 * Converts markdown files into Vue component based on the content's layout
 * and metadata.
 */
module.exports = function (source) {
  this.cacheable()

  // const options = loaderUtils.getOptions(this)
  // const config = options.config
  // console.log(config)
  // const filePath = this.resourcePath

  // if (!pagesData) pagesData = getPages(config)
  // const pageData = pagesData[filePath].page

  // if (!getLayout) getLayout = getLayouts(config)
  // const $layout = cheerio.load(loadLayout(getLayout(filePath), this), {
  //   xmlMode: true,                // special tags
  //   decodeEntities: false,        // allow HTML entities (needed for preprocessors)
  //   lowerCaseAttributeNames: false,
  //   lowerCaseTags: false
  // })

  return `
    <template><section v-html="content"></section></template>
    ${renderScript(source)}
    <style></style>
  `
}

/**
 * Creates script element for the file's metadata.
 */
function renderScript(source, pageData = {}) {
  const parser = markdownit({
    preset: 'default',
    html: true
    // highlight: renderHighlight
  })

  const markdown = fm(source).body
  // const data = Object.assign({}, pageData , {
  //   content: parser.render(markdown) // md -> html
  // })
  const data = { content: parser.render(markdown) }
  // ${JSON.stringify(data)}
  return `
    <script>
    export default {
      data() {
        return ${JSON.stringify(data)}
      }
    }
    </script>
  `
}

/**
 * Loads content template and style layout.
 */
// function loadLayout(layoutPath, loader) {
//   if (layoutPath) {
//     loader.addDependency(layoutPath)
//     return fs.readFileSync(layoutPath, 'utf-8')
//   } else { // default
//     return `
//      <template><section v-html="content"></section></template>
//      <style></style>
//    `
//   }
// }
