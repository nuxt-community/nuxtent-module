import { commonBefore, commonAfter } from './common/nuxt'
import simple from './scenarios/single'
import complex from './scenarios/multiple'
import baseUrl from './scenarios/baseUrl'
import component from './scenarios/component'

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

describe('dev - browserBaseURL', () => {
  baseUrl(commonBefore, commonAfter, {
    dev: true
  })
})

describe('dev - custom component', () => {
  component(commonBefore, commonAfter, {
    dev: true
  })
})
