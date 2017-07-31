module.exports = {
  content: [
    ['posts', {
      permalink: ":year/:slug",
      routes: [
        {
          path: "/_post",
          method: "get"
        },
        {
          path: "/archives",
          method: "getAll"
        }
      ]
    }],
    ['projects', {
      permalink: "/:slug",
      isPost: false,
      routes: [
        {
          path: "/projects/_slug",
          method: "get"
        },
        {
          path: "/projects",
          method: "getAll"
        }
      ]
    }]
  ]
}
