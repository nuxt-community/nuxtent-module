import { join } from 'path'

import ConfigFile from './util/config.file'
import { mdParser, yamlParser } from './util/parsers'

const NUXT_CONFIG_KEY = 'nuxtent'
const CONFIG_FILENAME = 'nuxtent.config.js'
const CONTENT_DIR = 'content'
const COMPONENTS_DIR = 'components'
const COMPONENTS_EXTENSIONS = ['.vue', '.js']
const BUILD_DIR = 'content'
const API_SERVER_PREFIX = '/content-api'
const API_BROWSER_PREFIX = '/_nuxt/content'
const API_DEFAULT_PORT = 3000

const mergeContentOptions = (content, defaults) => {
  const opts = {}
  if (!Array.isArray(content)) {
    opts['/'] = { ...defaults, ...content }
  } else {
    content.forEach(entry => {
      const entryIsArray = Array.isArray(entry)
      const dirName = entryIsArray ? entry[0] : entry
      const dirOpts = entryIsArray ? entry[1] : {}
      if (dirName === '/' && content.length > 1) {
        // prevent endpoint conflict
        throw new Error(
          'Top level files not allowed with nested registered directories'
        )
      }
      opts[join('/', dirName)] = { ...defaults, ...dirOpts }
    })
  }
  return opts
}

const getAPIOptions = (originalOptions = {}, isStatic) => {
  const options =
    typeof originalOptions === 'function'
      ? originalOptions(isStatic)
      : originalOptions

  const {
    baseURL = '',
    browserBaseURL = undefined,
    otherAPIOptions = {}
  } = options

  return {
    baseURL,
    browserBaseURL: browserBaseURL || baseURL,
    ...otherAPIOptions
  }
}

class ConfigManager {
  constructor(nuxtOptions, moduleOptions) {
    const configFile = new ConfigFile(
      join(nuxtOptions.rootDir, CONFIG_FILENAME)
    )

    const userOptions = {
      ...nuxtOptions[NUXT_CONFIG_KEY],
      ...moduleOptions,
      ...configFile.config
    }

    // TODO: Error if there's no provided `content` option

    const contentDir = join(nuxtOptions.srcDir, CONTENT_DIR)
    const contentDirWebpackAlias = '~/' + CONTENT_DIR
    const componentsDir = join(nuxtOptions.srcDir, COMPONENTS_DIR)
    const componentTemplatesExtensions = COMPONENTS_EXTENSIONS
    const buildDir = BUILD_DIR

    const isDev = nuxtOptions.dev

    const content = mergeContentOptions(userOptions.content, {
      page: null,
      permalink: ':slug',
      isPost: true,
      anchorLevel: 1,
      data: {},
      generate: []
    })

    const parsers = {
      md: {
        highlight: null,
        use: [],
        ...(userOptions.parsers && userOptions.parsers.md
          ? userOptions.parsers.md
          : {})
      },
      mdParser,
      yamlParser
    }

    const options = {
      dirs: {
        content: contentDir,
        contentWebpack: contentDirWebpackAlias,
        components: componentsDir,
        build: buildDir
      },
      componentTemplatesExtensions,
      isDev,
      content,
      parsers
    }

    this._config = Object.freeze(options)

    const port =
      process.env.PORT ||
      process.env.npm_package_config_nuxt_port ||
      API_DEFAULT_PORT

    this._api = Object.freeze({
      ...getAPIOptions(userOptions.api, false),
      port,
      serverPrefix: API_SERVER_PREFIX,
      browserPrefix: API_BROWSER_PREFIX
    })

    this._staticApi = Object.freeze({
      ...getAPIOptions(userOptions.api, true),
      port,
      serverPrefix: API_SERVER_PREFIX,
      browserPrefix: API_BROWSER_PREFIX
    })
  }

  get config() {
    return this._config
  }

  api(isStatic = false) {
    return isStatic ? this._staticApi : this._api
  }
}

export default ConfigManager
