module.exports = {
  content: [
    ['posts', {
      routeName: "post",
      permalink: ":year/:slug"
    }],
    ['projects', {
      routeName: "projects-name",
      permalink: "projects/:slug",
      isPost: false
    }]
  ]
}
