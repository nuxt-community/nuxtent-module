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
        },
        api: function(isStatic) {
          return {
            browserBaseURL: !isStatic ? '' : 'http://my.company.com'
          }
        }
      },
      {
        srcDir: resolve(__dirname, './fixtures'),
        ...config
      }
    )
  )

  afterAll(afterFunction)

  test('home', async () => {
    const html = await get('/')
    expect(html).toContain(
      `<div><h1>This is my home page with a custom browserBaseURL</h1><div><p>This is home!</p>
<p>Hooray!</p>
</div></div>`
    )
  })
}
