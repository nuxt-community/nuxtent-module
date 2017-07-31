module.exports = {
  modules: [
    'nuxtent'
  ],
  nuxtent: {
    content: {
      permalink: ':year/:slug',
      routes: [
        {
          path: '_post',
          method: 'get'
        },
        {
          path: 'archives',
          method: 'getAll'
        }
      ]
    }
  }
}
