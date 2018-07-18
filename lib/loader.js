const { existsSync } = require('fs')
const { join } = require('path')

const loaderUtils = require('loader-utils')
const uppercamelcase = require('uppercamelcase')
const paramCase = require('param-case')
const fm = require('front-matter')

const getDirOpts = (contentOptions, section) => {
  // configuration options can be for root files ('/') but regex for section also
  // captures closest subsection, so we first check that since you can't configure
  // both root files and nested sections
  return contentOptions['/'] ? contentOptions['/'] : contentOptions[section]
}

const getSection = dirPath => {
  // capture '/content/closestSubsection' or  '/content'
  const [, section] = dirPath.match(/[/\\]content([/\\][a-zA-Z\-_]*|$)/)
  return section === '' ? '/' : section
}

const getComponentBaseName = (baseDir, name, extensions) => {
  const baseName = join(baseDir, name)

  for (const key in extensions) {
    const extension = extensions[key]

    if (existsSync(baseName + extension)) {
      return name + extension
    }
  }
  return false
}

const mergeParserRules = (parserRules, rulesToAlter, fn) => {
  const newRules = {}

  for (const [ruleName, ruleFn] of Object.entries(parserRules)) {
    const newRule = rulesToAlter[ruleName]
      ? function() {
          return fn(ruleFn.apply(this))
        }
      : ruleFn

    newRules[ruleName] = newRule
  }

  return newRules
}

const mdComponents = (source, componentsDir, extensions) => {
  let transformedSource = source
  const componentExpression = new RegExp(
    [
      '(`{3}[\\s\\S]*?`{3}|`{1}[^`].*?`{1}[^`])', // code snippet
      // markdown component - '@[]' or '@[]()' or '@[#]():n' or @[/]
      '@\\[(#)?(\\/)?([\\w/\\-_\\\\]*?)\\](?:\\((.*?)\\))?'
    ].join('|'),
    'g'
  )

  let result
  const components = {}

  while ((result = componentExpression.exec(transformedSource))) {
    const [match, codeSnippet, isSlot, closeSlot, name, props] = result

    if (!codeSnippet) {
      const componentName = uppercamelcase(paramCase(name))
      if (!components[componentName]) {
        const component = getComponentBaseName(componentsDir, name, extensions)
        if (!component) {
          throw new Error(`"${name}" does not exist at ${componentsDir}`)
        }
        components[componentName] = component
      }
      if (closeSlot) {
        transformedSource = transformedSource.replace(
          match,
          `</${componentName}>`
        )
      } else if (isSlot) {
        // Not auto clossing tag
        transformedSource = transformedSource.replace(
          match,
          `<${componentName} ${props || ''}>`
        )
      } else {
        transformedSource = transformedSource.replace(
          match,
          `<${componentName} ${props || ''} />`
        )
      }
    }
  }

  return {
    transformedSource,
    components
  }
}

const mdCompParser = markdownParser => {
  // we need to add the `v-pre` snippet to code snippets so
  // that mustage tags (`{{ }}`) are interpreted as raw text
  if (markdownParser.renderer && markdownParser.renderer.rules) {
    const codeRules = ['code_inline', 'code_block', 'fence']

    markdownParser.renderer.rules = mergeParserRules(
      markdownParser.renderer.rules,
      codeRules,
      str => {
        return str.replace(/(<pre|<code)/g, '$1 v-pre')
      }
    )
  }
  return markdownParser
}

module.exports = function nuxtentLoader(source) {
  this.cacheable()

  const moduleOpts = loaderUtils.getOptions(this)

  const { content, componentsDir, extensions } = moduleOpts

  const section = getSection(this.context)
  const dirOpts = getDirOpts(content, section)

  const { instance, config } = dirOpts.parser
  const frontmatter = fm(source)
  const { transformedSource, components } = mdComponents(
    frontmatter.body,
    componentsDir,
    extensions
  )

  /**
   * import components from the array on the frontmatter $components
   */
  if (
    frontmatter.attributes['$components'] &&
    Array.isArray(frontmatter.attributes['$components'])
  ) {
    /**
     *  @type {Array}
     */
    frontmatter.attributes['$components'].forEach(name => {
      const componentName = uppercamelcase(paramCase(name))
      if (!components[componentName]) {
        const component = getComponentBaseName(componentsDir, name, extensions)
        if (!component) {
          throw new Error(`"${name}" does not exist at ${componentsDir}`)
        }
        components[componentName] = component
      }
    })
  }
  const template = mdCompParser(instance(config)).render(transformedSource)

  const allImports = Object.keys(components)
    .map(key => `import ${key} from '~/components/${components[key]}'`)
    .join('\n')

  const allComponents = Object.keys(components).join(', ')
  const [, fileName] = this.resourcePath.match(
    /[/\\]content([/\\\w\-_]*)(\.comp\.md$)?|$/
  )
  const componentName = uppercamelcase(paramCase(fileName))

  return `
    <template>
      <div>
        ${template}
      </div>
    </template>

    <script>
      ${allImports}
      export default {
        name: '${componentName}',
        components: {
          ${allComponents}
        },
        data: () => (${JSON.stringify(frontmatter.attributes)}),
      }
    </script>
  `
}
