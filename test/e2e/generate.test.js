import { generate, generateAfter } from './common/nuxt'
import simple from './scenarios/single'
import complex from './scenarios/multiple'

process.env.STATIC = true

describe('generate - single content types', () => {
  simple(generate, generateAfter)
})

describe('generate - multiple content types', () => {
  complex(generate, generateAfter)
})
