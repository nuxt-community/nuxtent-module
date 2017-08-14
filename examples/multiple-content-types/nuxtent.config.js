module.exports = {
  content: [
    ['posts', {
      page: '/_post',
      permalink: ":year/:slug",
      generate: ['get', 'getAll']
    }],
    ['projects', {
      page: '/projects/slug',
      permalink: "/:slug",
      isPost: false,
      generate: ['get', 'getAll']
    }]
  ]
}
