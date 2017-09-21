import { resolve } from 'path'

import test from 'ava'

import { get, commonBefore, commonAfter } from "../fixtures/nuxt";

test.before('Init Nuxt and Nuxtent', async () => {
  await commonBefore(
    {
      content: [
        [
          'posts',
          {
            page: '/posts/_slug',
            permalink: '/:year/:slug',
          }
        ],
        [
          'projects',
          {
            page: '/projects/_slug',
            permalink: "/projects/:slug",
            isPost: false
          }
        ]
      ]
    },
    {
      srcDir: resolve(__dirname, '../fixtures/multiple-content-types')
    }
  )()
})

test('index', async t => {
  const html = await get('/')
  t.true(html.includes('<section class="home-container"><h1>Nuxtent</h1><a href="/2015/first-post">See my first post</a><a href="/archives">See all my posts</a><a href="/projects/ency">See my first project</a><a href="/projects">See all my projects</a></section>'))
})

test('posts content - get', async t => {
  const html = await get('/2016/first-post')
  t.true(html.includes('<h1>My First Post</h1><div><p>This is my first post!</p>'))
})

test('posts content - getAll', async t => {
  const html = await get('/archives')
  t.true(html.includes('<section class="container"><h1>Posts</h1><ul><li><a href="/2016/first-post">My First Post</a></li></ul></section>'))
})

test('projects content - get', async t => {
  const html = await get('/projects/ency')
  t.true(html.includes(
`<section class="container"><h1>Project: Ency.js</h1><div><p>Pretty cool plugin!</p>
</div></section>`
  ))
})

test('projects content - getAll', async t => {
  const html = await get('/projects/')
  t.true(html.includes('<section class="container"><h1>Projects</h1><ul><li><a href="/projects/projects/nuxtent">Nuxt Content</a></li><li><a href="/projects/projects/ency">Ency.js</a></li></ul></section>'))
})

test.after('Closing server and nuxt.js', async () => {
  await commonAfter()
})
