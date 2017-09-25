import { generate, generateAfter } from '../fixtures/nuxt'

import simple from './simple.js'
import complex from './complex.js'

process.env.STATIC = true

describe('generate - simple', () => {
  simple(generate, generateAfter)
})

describe('generate - complex', () => {
  complex(generate, generateAfter)
})
