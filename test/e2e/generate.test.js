import { generate, generateAfter } from './common/nuxt'
import simple from './scenarios/single'
import complex from './scenarios/multiple'

describe('generate - single content types', () => {
  simple(generate, generateAfter)
})

describe('generate - multiple content types', () => {
  complex(generate, generateAfter)
})
