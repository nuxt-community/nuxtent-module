import { resolve } from 'path'

import { get } from '../../common/nuxt'

export default (beforeFunction, afterFunction, config = {}) => {
  beforeAll(
    beforeFunction(
      {
        content: [
          [
            'posts',
            {
              page: '/posts/_slug',
              permalink: '/:year/:slug',
              generate: ['get', 'getAll']
            }
          ],
          [
            'projects',
            {
              page: '/projects/_slug',
              permalink: '/projects/:slug',
              isPost: false,
              generate: ['get', 'getAll']
            }
          ]
        ]
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
      '<section class="home-container"><h1>Nuxtent</h1><a href="/2015/first-post">See my first post</a><a href="/archives">See all my posts</a><a href="/projects/ency">See my first project</a><a href="/projects">See all my projects</a></section>'
    )
  })

  test('posts content - get', async () => {
    const html = await get('/2016/first-post')
    expect(html).toContain(
      '<h1>My First Post</h1><div><p>This is my first post!</p>'
    )
  })

  test('posts content - getAll', async () => {
    const html = await get('/archives')
    expect(html).toContain(
      '<section class="container"><h1>Posts</h1><ul><li><a href="/2016/first-post">My First Post</a></li></ul></section>'
    )
  })

  test('projects content - get', async () => {
    const html = await get('/projects/ency')
    expect(html).toContain(
      `<section class="container"><h1>Project: Ency.js</h1><div><p>Pretty cool plugin!</p>
</div></section>`
    )
  })

  test('projects content - getAll', async () => {
    const html = await get('/projects/')
    expect(html).toContain(
      '<section class="container"><h1>Projects</h1><ul><li><a href="/projects/nuxtent">Nuxt Content</a></li><li><a href="/projects/ency">Ency.js</a></li></ul></section>'
    )
  })
}
