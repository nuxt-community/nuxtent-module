import simple from './simple.js'
import complex from './complex.js'

describe('dev - simple', () => {
  simple({
    dev: true
  })
})

describe('dev - complex', () => {
  complex({
    dev: true
  })
})
