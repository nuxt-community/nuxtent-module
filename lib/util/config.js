import { join } from 'path'

import anchors from 'markdown-it-anchor'
import { merge } from 'lodash'

import markdownParser from './markdownParser'
import slugify from './slugify'

const tocConfig = [
  {
    level: 2,
    permalink: true,
    permalinkClass: 'nuxtent-toc',
    permalinkSymbol: '🔗',
    slugify: slugify
  }
]
const loadNuxtentConfig = rootDir => {
  const rootConfig = join(rootDir, 'nuxtent.config.js')
  try {
    return require(rootConfig)
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return false
    }
    throw new Error(`[Invalid nuxtent configuration] ${err}`)
  }
}

const setTocOptions = dirOpts => {
  if (typeof dirOpts.toc === 'number') {
    dirOpts.markdown.plugins['toc'] = [
      anchors,
      {
        ...tocConfig,
        ...{ level: dirOpts.toc }
      }
    ]
  } else if (typeof dirOpts.toc === 'object') {
    dirOpts.markdown.plugins['toc'] = [
      anchors,
      { ...tocConfig, ...dirOpts.toc }
    ]
  } else if (dirOpts.toc === true) {
    dirOpts.markdown.plugins['toc'] = [anchors, tocConfig]
  }
}

/**
 * @param {(Array|Object)} content
 * @param {Object} defaults
 * @returns {Object} Content config
 */
const formatContentOptions = (content, defaults = {}) => {
  const opts = {}
  if (!Array.isArray(content)) {
    // Single type content
    setTocOptions(content)
    opts['/'] = merge({}, defaults, content)
    opts['/'].parser = {
      config: opts['/'].markdown,
      instance: markdownParser
    }
  } else {
    // Multiple type content
    content.forEach(entry => {
      const entryIsArray = Array.isArray(entry)
      if (!entryIsArray && typeof entry !== 'string') {
        throw new Error('Each entry should be an array or a string')
      }
      const dirName = entryIsArray ? entry[0] : entry
      const dirOpts = entryIsArray ? entry[1] : {}
      if (dirName === '/' && content.length > 1) {
        // prevent endpoint conflict
        throw new Error(
          'Top level files not allowed with nested registered directories'
        )
      }
      const key = join('/', dirName)
      setTocOptions(dirOpts)
      opts[key] = merge({}, defaults, dirOpts)
      opts[key].parser = {
        config: opts[key].markdown,
        instance: markdownParser
      }
    })
  }
  return opts
}

export default (moduleOptions = {}, options) => {
  const host = options.host || process.env.HOST || 'localhost'
  const port = options.port || process.env.PORT || '3000'
  const defaultConfig = {
    content: {
      isPost: true,
      data: false,
      breadcrumbs: false,
      toc: false,
      page: null,
      permalink: ':slug',
      generate: ['get', 'getAll'],
      markdown: {
        plugins: {}
      }
    },
    debug: false,
    api: {
      baseURL: `http://${host}:${port}`,
      browserBaseURL: '',
      apiServerPrefix: '/content-api',
      apiBrowserPrefix: options.build.publicPath + 'content'
    },
    markdown: {
      plugins: {},
      highlight: null,
      use: []
    },
    build: {
      contentDirWebpackAlias: '~/components',
      contentDir: join(options.srcDir, 'content'),
      componentsDir: join(options.srcDir, 'components'),
      buildDir: 'content',
      loaderComponentExtensions: ['.vue', '.js']
    }
  }
  const config = merge(
    {},
    defaultConfig,
    options.nuxtent,
    moduleOptions,
    loadNuxtentConfig(options.rootDir)
  )

  config.content = formatContentOptions(config.content, defaultConfig.content)

  return config
}
