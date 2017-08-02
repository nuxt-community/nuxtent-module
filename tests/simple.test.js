const { Nuxt, Builder } = require('nuxt')
const test = require('ava')
const { resolve } = require('path')

const host = 'localhost'
const port = 3000
const url = (route) => `http://${host}:${port}/${route}`

const basicConfig = require(resolve(__dirname, 'fixtures/nuxt.config.js'))({
  content: {
    permalink: '/:year/:slug',
    routes: [
      {
        path: '/_post',
        method: 'get'
      },
      {
        path: '/archives',
        method: 'getAll'
      }
    ]
  }
})

let nuxt = null
let server = null

test.before('Init Nuxt and Nuxtent', async () => {
  const config = Object.assign({}, {
    rootDir: resolve(__dirname, 'fixtures'),
    srcDir: resolve(__dirname, 'fixtures/single-content-type'),
    dev: false
  }, basicConfig)

  nuxt = new Nuxt(config)
  // await new Builder(nuxt).build()
  await nuxt.listen(port, host)
})

test('content - get', async t => {
  const { html } = await nuxt.renderRoute('2016/first-post')
  t.true(html.includes('<h1>My First Post</h1><div><p>This is my first post!</p>'))
})

test('content - getAll', async t => {
  const { html } = await nuxt.renderRoute('archives')
  t.true(html.includes('<li><a href="/2016/first-post">My First Post</a></li><li><a href="/2017/second-post">My Second Post</a></li>'
  ))
})

test.after('Closing server and nuxt.js', t => {
  nuxt.close()
})
