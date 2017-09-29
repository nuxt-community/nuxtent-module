import { generate, generateAfter } from './common/nuxt'
import simple from './scenarios/single'
import complex from './scenarios/multiple'
import baseUrl from './scenarios/baseUrl'
import component from './scenarios/component'

describe('generate - single content types', () => {
  simple(generate, generateAfter)
})

describe('generate - multiple content types', () => {
  complex(generate, generateAfter)
})

describe('generate - browserBaseURL', () => {
  baseUrl(generate, generateAfter)
})

describe('generate - custom component', () => {
  component(generate, generateAfter)
})
