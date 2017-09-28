import { resolve } from 'path'

import { get } from '../../common/nuxt'

export default (beforeFunction, afterFunction, config = {}) => {
  beforeAll(
    beforeFunction(
      {
        content: {
          page: '/_slug',
          permalink: '/:year/:slug',
          generate: ['get', 'getAll']
        }
      },
      {
        srcDir: resolve(__dirname, './fixtures'),
        ...config
      }
    )
  )

  afterAll(afterFunction)

  test('index', async () => {
    const html = await get('/')
    expect(html).toContain(
      '<h1>Index Page</h1><a href="/archives">Archives</a>'
    )
  })

  test('content - get', async () => {
    const html = await get('/2016/first-post')
    expect(html).toContain(
      '<h1>My First Post</h1><div><p>This is my first post!</p>'
    )
  })

  test('content - getAll', async () => {
    const html = await get('/archives')
    expect(html).toContain(
      '<h1>All Posts</h1><ul><li><a href="/2017/second-post">My Second Post</a></li><li><a href="/2016/first-post">My First Post</a></li></ul>'
    )
  })
}
