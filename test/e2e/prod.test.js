import { commonBefore, commonAfter } from '../fixtures/nuxt'

import simple from './simple.js'
import complex from './complex.js'

describe('prod - simple', () => {
  simple(commonBefore, commonAfter)
})

describe('prod - complex', () => {
  complex(commonBefore, commonAfter)
})
