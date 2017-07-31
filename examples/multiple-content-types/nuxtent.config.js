module.exports = {
  content: [
    ['posts', {
      permalink: ":year/:slug",
      routes: [
        {
          name: "post",
          method: "get"
        },
        {
          name: "archives",
          method: "getAll"
        }
      ]
    }],
    ['projects', {
      permalink: "/:slug",
      isPost: false,
      routes: [
        {
          name: "projects-name",
          method: "get"
        },
        {
          name: "projects",
          method: "getAll"
        }
      ]
    }]
  ]
}
