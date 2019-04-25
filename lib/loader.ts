import { existsSync } from 'fs'
import { join } from 'path'
import _ from 'lodash'
import matter from 'gray-matter'
import { loader } from 'webpack'
import { getOptions, OptionObject } from 'loader-utils'
import { Nuxtent } from '../types'
import MarkdownIt from 'markdown-it'
import { logger } from './utils'

type ContentOptions = Array<[string, Nuxtent.Config.Content]>

function getDirOpts(contentOptions: ContentOptions, section: string) {
  // configuration options can be for root files ('/') but regex for section also
  // captures closest subsection, so we first check that since you can't configure
  // both root files and nested sections
  const [, content = null] =
    contentOptions.find(([folder]) => {
      return folder === '/' || folder === section
    }) || []
  return content
}

function getSection(dirPath: string): string {
  // capture '/content/closestSubsection' or  '/content'
  const match = dirPath.match(/[/\\]content[/\\]([\w\-_\s]+|$)/)
  if (match) {
    return match[1] === '' ? '/' : match[1]
  }
  return '/'
}

const getComponentBaseName = (
  baseDir: string,
  name: string,
  extensions: string[]
) => {
  const baseName = join(baseDir, name)
  for (const extension of extensions) {
    // TODO: async
    if (existsSync(baseName + extension)) {
      return name + extension
    }
  }
  return false
}

const mergeParserRules = (
  parserRules: { [name: string]: MarkdownIt.TokenRender },
  rulesToAlter: string[]
) => {
  const newRules: { [name: string]: MarkdownIt.TokenRender } = {}
  for (const [ruleName, ruleFn] of Object.entries(parserRules)) {
    const renderer: MarkdownIt.TokenRender = (
      tokens,
      idx,
      options,
      env,
      self
    ) => {
      if (tokens[idx].attrIndex('v-pre') < 0) {
        tokens[idx].attrPush(['v-pre']) // add new attribute
      }
      // return self.renderToken(tokens, idx, options);
      return ruleFn(tokens, idx, options, env, self)
    }
    const newRule = rulesToAlter.includes(ruleName) ? renderer : ruleFn
    newRules[ruleName] = newRule
  }

  return newRules
}

function transformMdComponents(
  source: string,
  componentsDir: string,
  extensions: string[]
) {
  let transformedSource = source
  // (`{3}[\s\S]*?`{3}|`{1}[^`].*?`{1}[^`]) // Code snippet
  // |@\[(#)?(\/)?([\w/\-_\\]*?)\](?:\((.*?)\))? Or component
  // '@[]' or '@[]()' or '@[#]():n' or @[/]
  const componentExpression = new RegExp(
    /(`{3}[\s\S]*?`{3}|`{1}[^`].*?`{1}[^`])|@\[(#)?(\/)?([\w/\-_\\]*?)\](?:\((.*?)\))?/,
    'g'
  )

  let result = componentExpression.exec(transformedSource)
  const components: {
    [component: string]: string
  } = {}

  // This goes line for line looking for coincidences until it runs out
  while (result) {
    const [match, codeSnippet, isSlot, closeSlot, componentName, props] = result

    if (!codeSnippet) {
      if (!components[componentName]) {
        const component = getComponentBaseName(
          componentsDir,
          componentName,
          extensions
        )
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
    result = componentExpression.exec(transformedSource)
  }

  return {
    components,
    transformedSource,
  }
}

const mdCompParser = (markdownParser: markdownit) => {
  // we need to add the `v-pre` snippet to code snippets so
  // that mustage tags (`{{ }}`) are interpreted as raw text
  if (markdownParser.renderer && markdownParser.renderer.rules) {
    const codeRules = ['code_inline', 'code_block', 'fence']

    markdownParser.renderer.rules = mergeParserRules(
      markdownParser.renderer.rules,
      codeRules
    )
  }
  return markdownParser
}
export default function nuxtentLoader(
  this: loader.LoaderContext,
  source: string
) {
  const moduleOpts = getOptions(this)
  const content: ContentOptions = moduleOpts.content
  const componentsDir: string = moduleOpts.componentsDir
  const extensions: string[] = moduleOpts.extensions

  const section = getSection(this.context)
  const dirOpts = getDirOpts(content, section)
  if (!dirOpts) {
    logger.debug(
      `The folder ${section} is not configured in nuxtent and therefore ignored`
    )
    return
  }

  const [, fileName = ''] =
    this.resourcePath.match(/[/\\]content([/\\\w\-_]*)(\.comp\.md$)?|$/) || []
  if (!fileName) {
    this.emitError(new Error('The resource is not a markdown file'))
  }

  if (!dirOpts.markdown.parser) {
    return this.emitError(new Error('Could not found markdown parser'))
  }

  const frontmatter = matter(source)

  const { transformedSource, components } = transformMdComponents(
    frontmatter.content,
    componentsDir,
    extensions
  )

  /**
   * import components from the array on the frontmatter $components
   */
  if (
    frontmatter.data.$components &&
    Array.isArray(frontmatter.data.$components)
  ) {
    for (const name of frontmatter.data.$components) {
      const usedComponent = _.camelCase(name)
      if (!components[usedComponent]) {
        const component = getComponentBaseName(componentsDir, name, extensions)
        if (!component) {
          this.emitWarning(
            new Error(`"${name}" does not exist at ${componentsDir}`)
          )
          continue
        }
        components[usedComponent] = component
      }
    }
  }

  // We do need html
  dirOpts.markdown.parser.set({ html: true })
  const template = mdCompParser(dirOpts.markdown.parser).render(
    transformedSource
  )

  const asyncImports = Object.keys(components)
    .map(key => `${key}: () => import('~/components/${components[key]}')`)
    .join(',\n')

  const componentName = _.camelCase(fileName)
  const componentData = JSON.stringify({
    ...(frontmatter.data || {}),
    components,
  })
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
