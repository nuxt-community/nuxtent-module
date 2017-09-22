import { resolve } from 'path'

import test from 'ava'

import { get, commonBefore, commonAfter } from '../fixtures/nuxt'

test.before('Init Nuxt and Nuxtent', async () => {
  await commonBefore(
    {
      content: {
        page: '/_slug',
        permalink: '/:year/:slug'
      }
    },
    {
      srcDir: resolve(__dirname, '../fixtures/single-content-type')
    }
  )()
})

test('index', async t => {
  const html = await get('/')
  t.true(html.includes('<h1>Index Page</h1><a href="/archives">Archives</a>'))
})

test('content - get', async t => {
  const html = await get('/2016/first-post')
  t.true(
    html.includes('<h1>My First Post</h1><div><p>This is my first post!</p>')
  )
})

test('content - getAll', async t => {
  const html = await get('/archives')
  t.true(
    html.includes(
      '<h1>All Posts</h1><ul><li><a href="/2017/second-post">My Second Post</a></li><li><a href="/2016/first-post">My First Post</a></li></ul>'
    )
  )
})

test.after('Closing server and nuxt.js', async () => {
  await commonAfter()
})
