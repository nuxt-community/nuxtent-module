import { commonBefore, commonAfter } from './common/nuxt'
import simple from './scenarios/single'
import complex from './scenarios/multiple'
import component from './scenarios/component'

describe('prod - single content types', () => {
  simple(commonBefore, commonAfter)
})

describe('prod - multiple content types', () => {
  complex(commonBefore, commonAfter)
})

describe('prod - custom component', () => {
  component(commonBefore, commonAfter)
})
