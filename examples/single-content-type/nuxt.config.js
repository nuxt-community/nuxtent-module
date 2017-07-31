module.exports = {
  modules: [
    'nuxtent'
  ],
  nuxtent: {
    content: {
      permalink: '/:year/:slug',
      routes: [
        {
          name: 'post',
          method: 'get'
        },
        {
          name: 'archives',
          method: 'getAll'
        }
      ]
    }
  }
}
