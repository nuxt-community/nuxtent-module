import { commonBefore, commonAfter } from './common/nuxt'
import simple from './scenarios/single'
import complex from './scenarios/multiple'

describe('dev - single content types', () => {
  simple(commonBefore, commonAfter, {
    dev: true
  })
})

describe('dev - multiple content types', () => {
  complex(commonBefore, commonAfter, {
    dev: true
  })
})
