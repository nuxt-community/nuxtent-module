import { commonBefore, commonAfter } from './common/nuxt'
import simple from './scenarios/single'
import complex from './scenarios/multiple'

describe('prod - single content types', () => {
  simple(commonBefore, commonAfter)
})

describe('prod - multiple content types', () => {
  complex(commonBefore, commonAfter)
})
