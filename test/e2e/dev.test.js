import { commonBefore, commonAfter } from '../fixtures/nuxt'

import simple from './simple.js'
import complex from './complex.js'

describe('dev - simple', () => {
  simple(
    commonBefore,
    commonAfter,
    {
      dev: true
    }
  )
})

describe('dev - complex', () => {
  complex(
    commonBefore,
    commonAfter,
    {
      dev: true
    }
  )
})
