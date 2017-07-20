const fs = require('fs')
const loaderUtils = require('loader-utils')
const { existsSync, readFileSync } = require('fs')
const { join } = require('path')
const paramCase = require('param-case')
const fm = require('front-matter')
const initMdParser = (highlight, plugins) => {
  const mdParser = require('markdown-it')({
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true,
    highlight
  })
  if (!plugins) return mdParser
  plugins.forEach(plugin => {
    Array.isArray(plugin) ? mdParser.use.apply(mdParser, plugin) : mdParser.use(plugin)
  })
  return mdParser
}

module.exports = function (source) {
  this.cacheable()

  const options = loaderUtils.getOptions(this)

  const { body } = fm(source)
  const { template, components } = mdComponent(body, options)

  const allImports = Object.keys(components)
      .map(key => `import ${key} from '~components/${components[key]}'`).join(', ')

  const allComponents = Object.keys(components).join(', ')

  return `
    <template>
      <div>
        ${template}
      </div>
    </template>

    <script>
      ${allImports}
      export default {
        components: {
          ${allComponents}
        }
      }
    </script>
  `
}

const comps = {}
function mdComponent (source, { srcPath, sitePath, componentsDir, parser }) {
  // captures code or markdown component  -- '@[]' or '@[]()'
  const compExp = /(`{3}[a-z]*\n[\s\S]*?\n`{3})|(`{1}.*?`{1})|@\[(.*?)\](?:\((.*?)\))?/g
  let result
  while (result = compExp.exec(source)) {
    let [match, inlineCode, codeBlock, name, props] = result
    if (!inlineCode && !codeBlock) {
      const compName = paramCase(name)
      if (!comps[compName]) {
        const basePath = join(sitePath, componentsDir, '/')
        const ext = getExt(basePath, name)
        comps[compName] = name + ext
        // console.log(components)
        // TODO
        // 1.
        // if (srcPath !== sitePath) components[compName] = `["${compName}"]: require("~components/${name + ext}")`
        // else components[compName] = `["${compName}"]: () => import("~components/${name + ext}")`
        // 2.
        // components[compName] = `["${compName}"]: (resolve) => require(["~components/${name + ext}"], resolve)`
      }
      source = source.replace(match, `<${compName} ${props || ''} />`)
    }
  }

  const { highlight, use } = parser.md
  return {
    template: initMdParser(highlight, use).render(source),
    components: comps
  }
}

function getExt(basePath, name) {
  if (existsSync(basePath + name + '.vue')) return '.vue'
  else if (existsSync(basePath + name + '.js')) return '.js'
  else throw new Error(`"${name}" does not exist at ${basePath}`)
}
