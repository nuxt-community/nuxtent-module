import { resolve } from 'url'
import { join } from 'path'

import anchors from 'markdown-it-anchor'
import { merge } from 'lodash'

import markdownParser from './markdownParser'
import slugify from './slugify'

/**
 * @typedef {(Boolean|Number|Object)} TocConfig Configuration for toc
 * @property {Number} level The level of headings to parse
 * @property {Boolean} permalink Wether if attach a permalink to the heading
 * @property {String} permalinkClass The class to add to the permalink
 * @property {String} permalinkSymbol The text content of the permalink
 * @property {Function} slugify The slugify function to use
 */

/**
 * @typedef {Object} NuxtentMarkdownConfig The markdown config
 * @property {Object} markdown.plugins The plugins to use on markdown-it
 * @property {Function} [markdown.extend] Function that recibes the markdown-it config and returns a valid markdown-it config
 * @property {Function} [markdown.customize] Function that recibes the markdown-it instance
 */

/**
 * @typedef {Object} NuxtentContentGroup Content group
 * @property {Boolean} isPost Whether if the content is blog like or not
 * @property {Object} data Data to inject into every entry
 * @property {Boolean} breadcrumbs Whether if insert breacrumbs
 * @property {TocConfig} toc The toc configuration for the content group
 * @property {String} page The vue template to use
 * @property {String} permalink The permalink route
 * @property {Array} generate The methods to generate when using static build.
 *  Possible values are get, getAll and only
 * @property {NuxtentMarkdownConfig} markdown The markdown-it config
 */

/**
 * @typedef {Object} NuxtentConfig - Config for nuxtent module
 * @property {NuxtentContentGroup} content - An object of objects defining the content configuration
 * @property {Boolean} debug - Weather or not start in debuging mode
 * @property {String} contentDir
 * @property {Object} api - Api configuration
 */

/**
 * @var {TocConfig} tocConfig Default configuration for the toc
 */
const tocConfig = [
  {
    level: 2,
    permalink: true,
    permalinkClass: 'nuxtent-toc',
    permalinkSymbol: '🔗',
    slugify: slugify
  }
]

/**
 * Load the nuxtent config file
 * @param {String} rootDir The root of the proyect
 */
const loadNuxtentConfig = async rootDir => {
  const rootConfig = join(rootDir, 'nuxtent.config.js')
  const configModule = await import(rootConfig)
  try {
    return configModule.default
  } catch (err) {
    console.log(err.code)
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
 * @returns {NuxtentContentGroup{}} Content config
 */
const formatContentOptions = (content, defaults = {}) => {
  const opts = {}
  // Single type content
  if (!Array.isArray(content)) {
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
      const key = resolve('/', dirName)
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

/**
 * Parses the config from the user and outputs a standarized config with defaults
 * also here is where we should catch errors on config
 * @param {Object} moduleOptions config set on the nuxt.conf.js file
 * @param {Object} options Module options and state
 * @returns {NuxtentConfig} config
 */
export default (moduleOptions = {}, options) => {
  const host = options.host || process.env.HOST || 'localhost'
  const port = options.port || process.env.PORT || '3000'

  /**
   * @type {NuxtentContentGroup}
   */
  const defaultContent = {
    isPost: false,
    data: false,
    breadcrumbs: false,
    toc: false,
    page: null,
    permalink: ':slug',
    generate: ['get', 'getAll'],
    markdown: {
      plugins: {},
      extend: null
    }
  }
  /**
   * @type {NuxtentConfig}
   */
  const defaultConfig = {
    content: defaultContent,
    debug: false,
    api: {
      host,
      port,
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

  /**
   * @type {NuxtentConfig{}} nuxtentConfig - The nuxtent configuration
   */
  let nuxtentConfig = {}

  nuxtentConfig = merge(
    nuxtentConfig,
    defaultConfig,
    options.nuxtent,
    moduleOptions,
    loadNuxtentConfig(options.rootDir)
  )
  nuxtentConfig.content = formatContentOptions(
    nuxtentConfig.content,
    defaultConfig.content
  )

  return nuxtentConfig
}
