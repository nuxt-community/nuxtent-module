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

/* eslint-disable import/no-extraneous-dependencies */
/* covered by nuxt */
const debug = require('debug')('nuxt:module:nuxtent:plugin:collector-files')

function normalizeWindowsPath(value: string) {
  return value.replace(/(\/|\\)+/g, path.sep)
}

export function getKey(name: string, json: NuxtentTransformResult): string {
  if (json.data.path) {
    debug(`key for '${name}' is '${json.data.path}' (from json)`)
    return json.data.path
  }
  // normalize windows path
  name = normalizeWindowsPath(name)
  // remove (index).md,json etc, for key
  const key = name
    // remove extension for prettier keys
    .replace(/.(md|json)$/, '')
    // remove index too
    .replace(/\/index$/, '')
  debug(`key for '${name}' is '${key}' (automatically computed)`)
  return key
}

export function formatDate(dateString: string) {
  const date = new Date(dateString).toISOString()
  return date.substring(0, date.indexOf('T'))
}

/**
 * If a date is present, we use it in order to naturally sort the items in db
 * as level sorts by name (YYYY-MM-DD does the trick).
 * If not, we just use alphabetical order.
 */
export function makeSortedKey(key: string, json: NuxtentTransformResult) {
  if (typeof json.data.date === 'string') {
    return `${formatDate(json.data.date)}-${key}`
  }
  return key
}

export function getFields(json: NuxtentTransformResult) {
  const keys = Object.keys(json.data)
  return keys.filter(key => key !== 'author' && key !== 'authors')
}

function isLiteral(value) {
  const type = typeof value
  return type === 'string' || type === 'number' || type === 'boolean'
}

function isArrayOfLiterals(array) {
  return Array.isArray(array) && array.every(isLiteral)
}

export function getFieldValue(json: NuxtentTransformResult, key: string) {
  if (isArrayOfLiterals(json.data[key])) {
    return json.data[key]
  }
  if (isLiteral(json.data[key])) {
    return [json.data[key]]
  }
  return []
}

export function getAuthors(json: NuxtentTransformResult) {
  if (typeof json.data.author === 'string') {
    return [json.data.author]
  }
  if (Array.isArray(json.data.authors)) {
    return json.data.authors
  }
  return []
}

const dateLength = 'YYYY-MM-DD'.length
export function injectData(
  name: string,
  json: NuxtentTransformResult
): NuxtentTransformResult {
  let date
  try {
    date = formatDate(name.slice(0, dateLength))
  } catch (e) {
    // date is not valid
  }
  return {
    data: {
      date,
      filename: name,
      ...json.data
    },
    partial: {
      date,
      filename: name,
      ...json.data
    }
  }
}

export default function() {
  return {
    name: 'nuxtent/collector-files',
    collect(db: NuxtentDB, name: string, json: NuxtentTransformResult) {
      name = normalizeWindowsPath(name)
      const key = getKey(name, json)
      const adjustedJSON = injectData(name, json)
      const pathSegments = name.split(path.sep)
      const allPaths = pathSegments.reduce((acc, v) => {
        acc.push(acc.length > 0 ? acc[acc.length - 1] + '/' + v : v)
        return acc
      }, [])
      return Promise.all(
        allPaths.map(pathName => {
          const relativeKey = key.replace(pathName + '/', '')
          const sortedKey = makeSortedKey(relativeKey, json)
          debug(`collecting ${relativeKey} for path '${pathName}'`)
          return Promise.all([
            // full resource, not sorted
            db.put([pathName], relativeKey, {
              ...adjustedJSON,
              id: relativeKey
            }),
            // sorted list
            db.put([pathName, 'default'], sortedKey, { id: relativeKey }),
            // sorted list, filtered by authors
            ...getAuthors(json).map(author => {
              return Promise.all([
                db.put([pathName, 'authors', author], sortedKey, {
                  id: relativeKey
                }),
                db.put(['authors', pathName], author, { id: author })
              ])
            }),
            ...getFields(json).map(type => {
              return getFieldValue(json, type).map(value =>
                Promise.all([
                  // sorted list, filtered by tags
                  db.put([pathName, type, value], sortedKey, {
                    id: relativeKey
                  }),
                  // global tag list
                  db.put([type], value, { id: value, partial: value }),
                  db.put([type, 'default'], value, {
                    id: value,
                    partial: value
                  }),
                  db.put([type, 'path', pathName], value, {
                    id: value,
                    partial: value
                  })
                ])
              )
            })
          ])
        })
      )
    }
  }
}
