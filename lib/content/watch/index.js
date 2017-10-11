// @flow

/*
  The MIT License (MIT)

  Copyright (c) 2015 Maxime Thirouin

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
 */

import { join } from 'path'

import globby from 'globby'

/* eslint-disable import/no-extraneous-dependencies */
/* covered by nuxt */
const debug = require('debug')('nuxt:module:nuxtent:watch')

const toFile = (root, filepath) => ({
  name: filepath,
  fullpath: join(root, filepath)
})

function reduceExtensions(plugins: NuxtentPlugins): Array<string> {
  const supportedFileTypes = plugins.reduce((acc, plugin: NuxtentPlugin) => {
    if (plugin.supportedFileTypes) {
      debug(
        `'${plugin.name}' want to support '${String(
          plugin.supportedFileTypes
        )}'`
      )
    }
    return [
      ...acc,
      ...(plugin &&
      plugin.supportedFileTypes &&
      Array.isArray(plugin.supportedFileTypes)
        ? plugin.supportedFileTypes
        : [])
    ]
  }, [])
  debug('extensions to watch', supportedFileTypes)
  return supportedFileTypes
}

const getGlobPattern = (plugins: NuxtentPlugins): Array<string> =>
  reduceExtensions(plugins).map((extension: string) => `**/*.${extension}`)

const glob = (path, patterns) =>
  globby.sync(patterns, { cwd: path }).map(file => toFile(path, file))

const oneShot = (
  path: string,
  plugins: NuxtentPlugins
): Array<NuxtentContentFile> => glob(path, getGlobPattern(plugins))

export { oneShot }
