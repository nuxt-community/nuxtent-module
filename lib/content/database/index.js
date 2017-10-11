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

import findCacheDir from 'find-cache-dir'
import levelUp from 'levelup'
import levelDown from 'leveldown'
import subLevel from 'level-sublevel'

const cacheDir = findCacheDir({ name: 'nuxtent/db', create: true })

const database = levelUp(cacheDir, err => {
  if (err && err.message.startsWith('IO error: lock')) {
    throw new Error(
      'Cannot create a Nuxtent database. ' +
        'Another one is probably is running.' +
        '\n' +
        "Check that you don't have a development server running in the background" +
        ' and try again.'
    )
  }
})
const level = subLevel(database)
const options = { valueEncoding: 'json' }
const wrapStreamConfig = config => Object.assign({}, config, options)

function getSublevel(
  db: Sublevel,
  sub: string | Array<string>,
  filter: ?string,
  filterValue: ?string
) {
  if (!Array.isArray(sub)) {
    sub = [sub]
  }
  if (filter) {
    sub = sub.concat(filter)
    if (filter !== 'default' && filterValue) {
      sub = sub.concat(filterValue)
    }
  }
  return sub.reduce((db: Sublevel, name) => db.sublevel(name), db)
}

async function getDataRelation(fieldName, keys) {
  let partial = null
  try {
    if (Array.isArray(keys)) {
      partial = await Promise.all(
        keys.map(key => db.getPartial(fieldName, key))
      )
    } else {
      partial = await db.getPartial(fieldName, keys)
    }
    return partial
  } catch (error) {
    return keys
  }
}

async function getDataRelations(fields) {
  const keys = Object.keys(fields)
  const resolvedValues = await Promise.all(
    keys.map(key => getDataRelation(key, fields[key]))
  )
  return keys.reduce((resolvedFields, key, index) => {
    resolvedFields[key] = resolvedValues[index]
    return resolvedFields
  }, {})
}

const db = {
  destroy(): Promise<void> {
    return new Promise((resolve, reject) => {
      database.close(() => {
        levelDown.destroy(cacheDir, error => {
          if (error) {
            reject(error)
          } else {
            database.open(() => {
              resolve()
            })
          }
        })
      })
    })
  },
  put(sub: string | Array<string>, key: string, value: any): Promise<Object> {
    return new Promise((resolve, reject) => {
      const data = { ...value, key }
      return getSublevel(level, sub).put(key, data, options, error => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })
  },
  get(sub: string | Array<string>, key: string): Promise<Object> {
    return new Promise((resolve, reject) => {
      return getSublevel(level, sub).get(key, options, async function(
        error,
        data
      ) {
        if (error) {
          reject(error)
        } else {
          const { body, ...metadata } = data.data
          const relatedData = await getDataRelations(metadata)
          resolve({
            key: key,
            value: {
              ...relatedData,
              body
            }
          })
        }
      })
    })
  },
  getPartial(sub: string | Array<string>, key: string): Promise<Object> {
    return new Promise((resolve, reject) => {
      return getSublevel(level, sub).get(key, options, (error, data) => {
        if (error) {
          reject(error)
        } else {
          const type = typeof data.partial
          if (type === 'string' || type === 'number' || type === 'boolean') {
            resolve(data.partial)
          } else {
            resolve({ id: key, ...data.partial })
          }
        }
      })
    })
  },
  getList(
    sub: string | Array<string>,
    config: LevelStreamConfig,
    filter: string = 'default',
    filterValue: string
  ): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      const array = []
      // $FlowFixMe waaaat? sublevel is level so createReadStream is available
      getSublevel(level, sub, filter, filterValue)
        .createReadStream(wrapStreamConfig(config))
        .on('data', async function(data) {
          array.push(
            db.getPartial(sub, data.value.id).then(value => {
              const type = typeof value
              if (
                type === 'string' ||
                type === 'number' ||
                type === 'boolean' ||
                Array.isArray(value)
              ) {
                return {
                  key: data.key,
                  value
                }
              }
              return {
                ...value,
                key: data.key
              }
            })
          )
        })
        .on('end', async function() {
          const returnValue = await Promise.all(array)
          resolve(returnValue)
        })
        .on('error', error => {
          reject(error)
        })
    })
  }
}

export default db
