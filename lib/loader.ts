import { existsSync } from 'fs'
import { join } from 'path'
import _ from 'lodash'
import matter from 'gray-matter'

import { getOptions } from 'loader-utils'

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
      const componentName = _.camelCase(name)
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

export default function nuxtentLoader(source) {
  this.cacheable()

  const moduleOpts = getOptions(this)

  const { content, componentsDir, extensions } = moduleOpts

  const section = getSection(this.context)
  const dirOpts = getDirOpts(content, section)

  const frontmatter = matter(source)
  const { transformedSource, components } = mdComponents(
    frontmatter.content,
    componentsDir,
    extensions
  )

  /**
   * import components from the array on the frontmatter $components
   */
  if (
    frontmatter.data['$components'] &&
    Array.isArray(frontmatter.data['$components'])
  ) {
    frontmatter.data['$components'].forEach(name => {
      const componentName = _.camelCase(name)
      if (!components[componentName]) {
        const component = getComponentBaseName(componentsDir, name, extensions)
        if (!component) {
          throw new Error(`"${name}" does not exist at ${componentsDir}`)
        }
        components[componentName] = component
      }
    })
  }
  const template = mdCompParser(dirOpts.parser).render(transformedSource)

  const asyncImports = Object.keys(components)
    .map(key => `${key}: () => import('~/components/${components[key]}')`)
    .join(',\n')

  const [, fileName] = this.resourcePath.match(
    /[/\\]content([/\\\w\-_]*)(\.comp\.md$)?|$/
  )
  const componentName = _.camelCase(fileName)
  const componentData = JSON.stringify(frontmatter.data || {})
  return `
    <template>
      <component :is="tag">
        ${template}
      </component>
    </template>

    <script>
    import { interopDefault } from '~/.nuxt/utils'
    export default {
        name: '${componentName}',
        components: {
          ${asyncImports}
        },
        data: () => (${componentData}),
        props: {
          tag: {
            default: 'div',
            type: [String, Object]
          }
        }
      }
    </script>
  `
}
