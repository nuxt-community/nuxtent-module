module.exports = {
  data: {
    siteName: "Nuxt-Content"
  },
  dirs: [
    ["/", {
      isPost: false
    }],
    ["posts", {
      routeName: "post",
      permalink: ":year/:slug",
      data: {
        category: "Posts"
      }
    }],
    ["projects", {
      routeName: "projects-name",
      permalink: "projects/:slug",
      isPost: false
    }]
  ]
}
