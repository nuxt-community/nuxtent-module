const fs = require('fs')
const loaderUtils = require('loader-utils')
const { existsSync, readFileSync } = require('fs')
const { join } = require('path')
const uppercamelcase = require('uppercamelcase')
const paramCase = require('param-case')
const fm = require('front-matter')

const mdCompParser = (mdParser) => {
  // we need to add the `v-pre` snippet to code snippets so
  // that mustage tags (`{{ }}`) are interpreted as raw text
  const codeRules = ['code_inline', 'code_block', 'fence' ]
  const parser = mergeParserRules(mdParser, codeRules, (str) => {
     return str.replace(/(<pre|<code)/g, '$1 v-pre')
  })
  return parser
}

const mdComponent = (source, moduleOpts, dirOpts) => {
  const { srcPath, sitePath, componentsDir, parsers } = moduleOpts

  const compExp = new RegExp([
    '(`{3}[\\s\\S]*?`{3}|`{1}[^`].*?`{1}[^`])',  // code snippet
    '@\\[(.*?)\\](?:\\((.*?)\\))?',              // markdown component - '@[]' or '@[]()'
  ].join('|'), 'g')

  let result
  const comps = {}
  while (result = compExp.exec(source)) {
    let [match, codeSnippet, name, props] = result
    if (!codeSnippet) {
      const compName = uppercamelcase(paramCase(name))
      if (!comps[compName]) {
        const basePath = join(sitePath, componentsDir, '/')
        const ext = getExt(basePath, name)
        comps[compName] = name + ext
      }
      source = source.replace(match, `<${compName} ${props || ''} />`)
    }
  }

  const { mdParser, md } = parsers

  return {
    template: mdCompParser(parsers.mdParser(md, dirOpts)).render(source),
    components: comps
  }
}

module.exports = function (source) {
  this.cacheable()

  const moduleOpts = loaderUtils.getOptions(this)
  const section = getSection(this.context)
  const dirOpts = getDirOpts(moduleOpts, section)

  const { body } = fm(source)
  const { template, components } = mdComponent(body, moduleOpts, dirOpts)

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

function getDirOpts (moduleOpts, section) {
  // configuration options can be for root files ('/') but regex for section also
  // captures closest subsection, so we first check that since you can't configure
  // both root files and nested sections
  if (moduleOpts.content['/']) return moduleOpts.content['/']
  else moduleOpts.content[section]
}

function getSection (path) {
  // capture '/content/closestSubsection' or  '/content'
  const [match, section] = path.match(/\/content([\/][a-zA-Z\-_]*|$)/)
  return section === '' ? '/' : section
}

function getExt(basePath, name) {
  if (existsSync(basePath + name + '.vue')) return '.vue'
  else if (existsSync(basePath + name + '.js')) return '.js'
  else throw new Error(`"${name}" does not exist at ${basePath}`)
}
