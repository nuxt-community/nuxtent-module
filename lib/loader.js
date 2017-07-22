const fs = require('fs')
const loaderUtils = require('loader-utils')
const { existsSync, readFileSync } = require('fs')
const { join } = require('path')
const uppercamelcase = require('uppercamelcase')
const paramCase = require('param-case')
const fm = require('front-matter')
const markdownit = require('markdown-it')

const mdParser = (highlight, plugins) => {
  const parser = markdownit({
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true,
    highlight
  })
  if (!plugins) return parser
  plugins.forEach(plugin => {
    Array.isArray(plugin) ? parser.use.apply(parser, plugin) : parser.use(plugin)
  })
  return parser
}

const mdCompParser = (mdParser) => {
  // we need to add the `v-pre` snippet to code snippets so
  // that mustage tags (`{{ }}`) are interpreted as raw text
  const codeRules = ['code_inline', 'code_block', 'fence' ]
  const parser = mergeParserRules(mdParser, codeRules, (str) => {
     return str.replace(/(<pre|<code)/g, '$1 v-pre')
  })
  return parser
}

const mdComponent = (source, { srcPath, sitePath, componentsDir, parser }) => {
  // captures code or markdown component  -- '@[]' or '@[]()'
  const compExp = /(`{3}[a-z]*\n[\s\S]*?\n`{3})|(`{1}.*?`{1})|@\[(.*?)\](?:\((.*?)\))?/g
  let result
  const comps = {}
  while (result = compExp.exec(source)) {
    let [match, inlineCode, codeBlock, name, props] = result
    if (!inlineCode && !codeBlock) {
      const compName = uppercamelcase(paramCase(name))
      if (!comps[compName]) {
        const basePath = join(sitePath, componentsDir, '/')
        const ext = getExt(basePath, name)
        comps[compName] = name + ext
      }
      source = source.replace(match, `<${compName} ${props || ''} />`)
    }
  }

  const { highlight, use } = parser.md

  return {
    template: mdCompParser(mdParser(highlight, use)).render(source)
    components: comps
  }
}

module.exports = function (source) {
  this.cacheable()

  const options = loaderUtils.getOptions(this)

  const { body } = fm(source)
  const { template, components } = mdComponent(body, options)

  const allImports = Object.keys(components)
      .map(key => `import ${key} from '~components/${components[key]}'`).join('\n')

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

function mergeParserRules (parser, rules, fn) {
  if (parser.renderer && parser.renderer.rules) {
    const parserRules = parser.renderer.rules
    rules.forEach(function (rule) {
      if (!parserRules[rule]) return
      const defaultRule = parserRules[rule]
      parserRules[rule] = function () {
        return fn(defaultRule.apply(this, arguments))
      }
    })
  }
  return parser
}

function getExt(basePath, name) {
  if (existsSync(basePath + name + '.vue')) return '.vue'
  else if (existsSync(basePath + name + '.js')) return '.js'
  else throw new Error(`"${name}" does not exist at ${basePath}`)
}
