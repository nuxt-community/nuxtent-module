/* eslint-disable */
/* global describe, it, expect, beforeEach, sinon */

import createDatabase from '../../../lib/content/database'

import { resolve } from 'path'

describe('database API', function() {
  it('loads single content type', () => {
    const contentPath = '../../fixtures/single-content-type/content'
    const dirName = '/'
    const options = {
      permalink: '/:slug'
    }
    const db = createDatabase(contentPath, dirName, options)
    // TODO
    // expect().to.not.throw(Error)
  })
})
