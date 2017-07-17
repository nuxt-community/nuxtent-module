const fs = require('fs')

const loaderUtils = require('loader-utils')

const { existsSync, readFileSync } = require('fs')
const { join } = require('path')

const paramCase = require('param-case')
const fm = require('front-matter')
const mdParser = require('markdown-it')({
  preset: 'default',
  html: true,
  typographer: true,
  linkify: true,
  // highlight: renderHighlight
})

/**
 * Converts markdown files into Vue component based on the content's layout
 * and metadata.
 */
module.exports = function (source) {
  this.cacheable()

  const options = loaderUtils.getOptions(this)

  const { body } = fm(source)
  const { template, components } = mdComponent(body, options)

  return `
    <template>
      <div> ${template} </div>
    </template>

    <script>
      export default {
        components: {
          ${components}
        }
      }
    </script>
  `
}

function mdComponent (source, { srcPath, sitePath, componentsDir }) {
  const compExp = /@\[(.*?)\](?:\((.*?)\))?/g // captures `@[]` and `@[]()``
  let result
  const components = {}
  while (result = compExp.exec(source)) {
    let [match, name, props] = result
    const compName = 'content-' + paramCase(name)
    if (!components[compName]) {
      const basePath = join(sitePath, componentsDir, '/')
      const ext = getExt(basePath, name)
      if (srcPath !== sitePath) components[compName] = `["${compName}"]: require("~components/${name + ext}")`
      else components[compName] = `["${compName}"]: () => import("~components/${name + ext}")`
    }
    source = source.replace(match, `<${compName} ${props || ''} />`)
  }

  return {
    template: mdParser.render(source),
    components: Object.keys(components).map(key => components[key]).join(', ')
  }
}

function getExt(basePath, name) {
  if (existsSync(basePath + name + '.vue')) return '.vue'
  else if (existsSync(basePath + name + '.js')) return '.js'
  else throw new Error(`"${name}" does not exist at ${basePath}`)
}
