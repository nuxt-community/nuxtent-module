module.exports = {
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
}
