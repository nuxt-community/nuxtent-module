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

import path from 'path'

import readFile from '../../util/readFile'

/* eslint-disable import/no-extraneous-dependencies */
/* covered by nuxt */
const debug = require('debug')('nuxt:module:nuxtent:injection')

const defaultTransformPlugin: NuxtentPlugin = {
  name: 'nuxtent/plugin-default-transform',
  supportedFileTypes: [],
  transform({ contents }: { contents: Buffer }) {
    return {
      partial: null,
      data: {
        body: contents
      }
    }
  }
}

async function processFile({
  config,
  db,
  file,
  transformers,
  collectors,
  isProduction
}: {
  config: NuxtentConfig,
  db: NuxtentDB,
  file: NuxtentContentFile,
  transformers: NuxtentPlugins,
  collectors: NuxtentPlugins,
  isProduction?: boolean
}) {
  debug(`processing ${file.name}`)
  const contents = await readFile(file.fullpath)
  const transformPlugin = transformers.find(
    (plugin: NuxtentPlugin) =>
      Array.isArray(plugin.supportedFileTypes) &&
      plugin.supportedFileTypes.indexOf(path.extname(file.name).slice(1)) !== -1
  )
  const plugin = transformPlugin || defaultTransformPlugin
  if (typeof plugin.transform !== 'function') {
    throw new Error('transform plugin must implement a transform() method')
  }
  const parsed: NuxtentTransformResult = await plugin.transform({
    config,
    file,
    contents
  })

  debug(`${file.name} processed`)
  // Don't show drafts in production
  if (isProduction && parsed.data.draft) {
    debug(`${file.name} skipped because it's a draft`)
    return
  }

  const processedFile = await collectors.forEach((plugin: NuxtentPlugin) => {
    typeof plugin.collect === 'function' &&
      plugin.collect(db, file.name, parsed)
  })
  return processedFile
}

export default processFile
