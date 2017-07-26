module.exports = {
  content: [
    ['posts', {
      permalink: ":year/:slug",
      routes: [
        {
          name: "post",
          method: "get"
        }
      ]
    }],
    ['projects', {
      permalink: "projects/:slug",
      isPost: false,
      routes: [
        {
          name: "projects-name",
          method: "get"
        }
      ]
    }]
  ]
}
