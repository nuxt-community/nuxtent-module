import { resolve } from 'path'

import { get } from '../../common/nuxt'

export default (beforeFunction, afterFunction, config = {}) => {
  beforeAll(
    beforeFunction(
      {
        content: {
          page: '/_slug',
          permalink: '/:slug',
          isPost: false,
          generate: ['get']
        }
      },
      {
        srcDir: resolve(__dirname, './fixtures'),
        ...config
      }
    )
  )

  afterAll(afterFunction)

  test.skip('home', async () => {
    const html = await get('/')
    expect(html).toContain(
      '<h1>Index Page</h1><div><iframe id="ytplayer" type="text/html" width="640" height="360" src="http://www.youtube.com/embed/0TYnoYl1JfY?autoplay=0" frameborder="0"></iframe></div>'
    )
  })
}
